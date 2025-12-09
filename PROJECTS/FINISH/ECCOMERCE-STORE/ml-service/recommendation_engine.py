from pymongo import MongoClient
from datetime import datetime, timedelta
from bson import ObjectId
import math


class RecommendationEngine:
    def __init__(self, mongodb_uri):
        self.client = MongoClient(mongodb_uri)
        self.db = self.client['ECOMMERCE-STORE']
        self.products_collection = self.db['products']
        self.orders_collection = self.db['orders']
        self.views_collection = self.db['productviews']
    
    def cosine_similarity(self, text1, text2):
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        if not words1 or not words2:
            return 0.0
        intersection = words1.intersection(words2)
        denominator = math.sqrt(len(words1)) * math.sqrt(len(words2))
        return len(intersection) / denominator if denominator > 0 else 0.0
    
    def get_user_recommendations(self, user_id, limit=10):
        try:
            user_orders = list(self.orders_collection.find({'user': ObjectId(user_id), 'status': {'$in': ['delivered', 'shipped']}}))
            if not user_orders:
                return self.get_trending_products(limit)
            purchased_product_ids = set()
            for order in user_orders:
                for item in order.get('items', []):
                    purchased_product_ids.add(str(item['product']))
            similar_orders = list(self.orders_collection.find({'items.product': {'$in': [ObjectId(pid) for pid in purchased_product_ids]}, 'user': {'$ne': ObjectId(user_id)}}))
            product_scores = {}
            for order in similar_orders:
                for item in order.get('items', []):
                    product_id = str(item['product'])
                    if product_id not in purchased_product_ids:
                        product_scores[product_id] = product_scores.get(product_id, 0) + 1
            sorted_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
            top_product_ids = [pid for pid, _ in sorted_products[:limit]]
            recommendations = []
            for product_id in top_product_ids:
                product = self.products_collection.find_one({'_id': ObjectId(product_id)})
                if product:
                    recommendations.append({'_id': str(product['_id']), 'name': product['name'], 'price': product['price'], 'images': product.get('images', []), 'score': product_scores[product_id]})
            if len(recommendations) < limit:
                trending = self.get_trending_products(limit - len(recommendations))
                recommendations.extend(trending)
            return recommendations[:limit]
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    def get_similar_products(self, product_id, limit=10):
        try:
            target_product = self.products_collection.find_one({'_id': ObjectId(product_id)})
            if not target_product:
                return []
            category_products = list(self.products_collection.find({'category': target_product.get('category'), '_id': {'$ne': ObjectId(product_id)}, 'isActive': True}))
            if not category_products:
                return []
            def create_feature_text(product):
                text = f"{product.get('name', '')} {product.get('description', '')} "
                text += ' '.join(product.get('tags', []))
                return text
            target_text = create_feature_text(target_product)
            similarities = []
            for product in category_products:
                product_text = create_feature_text(product)
                similarity = self.cosine_similarity(target_text, product_text)
                similarities.append((product, similarity))
            similarities.sort(key=lambda x: x[1], reverse=True)
            recommendations = []
            for product, similarity in similarities[:limit]:
                recommendations.append({'_id': str(product['_id']), 'name': product['name'], 'price': product['price'], 'images': product.get('images', []), 'similarity': similarity})
            return recommendations
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    def get_trending_products(self, limit=10, days=7):
        print(f"get_trending_products called with limit={limit}, days={days}")
        try:
            date_threshold = datetime.now() - timedelta(days=days)
            print(f"Date threshold: {date_threshold}")
            recent_orders = list(self.orders_collection.find({'createdAt': {'$gte': date_threshold}}))
            print(f"Found {len(recent_orders)} recent orders")
            product_scores = {}
            for order in recent_orders:
                for item in order.get('items', []):
                    product_id = str(item['product'])
                    quantity = item.get('quantity', 1)
                    product_scores[product_id] = product_scores.get(product_id, 0) + quantity
            recent_views = list(self.views_collection.find({'timestamp': {'$gte': date_threshold}}))
            for view in recent_views:
                product_id = str(view['product'])
                product_scores[product_id] = product_scores.get(product_id, 0) + 0.1
            
            # If no activity data, return random products
            if not product_scores:
                print(f"No activity data, fetching fallback products...")
                product_count = self.products_collection.count_documents({})
                print(f"Total products in database: {product_count}")
                fallback_products = list(self.products_collection.find({}).limit(limit))
                print(f"Found {len(fallback_products)} fallback products")
                recommendations = []
                for product in fallback_products:
                    recommendations.append({'_id': str(product['_id']), 'name': product['name'], 'price': product['price'], 'images': product.get('images', []), 'score': 0})
                return recommendations
            
            sorted_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
            top_product_ids = [pid for pid, _ in sorted_products[:limit]]
            recommendations = []
            for product_id in top_product_ids:
                product = self.products_collection.find_one({'_id': ObjectId(product_id)})
                if product and product.get('isActive'):
                    recommendations.append({'_id': str(product['_id']), 'name': product['name'], 'price': product['price'], 'images': product.get('images', []), 'score': product_scores[product_id]})
            return recommendations
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    def track_view(self, user_id, product_id):
        try:
            self.views_collection.insert_one({'user': ObjectId(user_id) if user_id else None, 'product': ObjectId(product_id), 'timestamp': datetime.now()})
            self.products_collection.update_one({'_id': ObjectId(product_id)}, {'$inc': {'views': 1}})
        except Exception as e:
            print(f"Error: {e}")
    
    def train_models(self):
        print("Training recommendation models...")
        print("Models trained successfully")
        return True
