from flask import Flask, request, jsonify
from flask_cors import CORS
from recommendation_engine import RecommendationEngine
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize recommendation engine
engine = RecommendationEngine(os.getenv('MONGODB_URI'))

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'ML Recommendation Service'})

@app.route('/recommendations/user/<user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    """Get personalized recommendations for a user"""
    try:
        limit = int(request.args.get('limit', 10))
        recommendations = engine.get_user_recommendations(user_id, limit)
        return jsonify({
            'status': 'success',
            'data': recommendations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/recommendations/similar/<product_id>', methods=['GET'])
def get_similar_products(product_id):
    """Get similar products based on content"""
    try:
        limit = int(request.args.get('limit', 10))
        similar = engine.get_similar_products(product_id, limit)
        return jsonify({
            'status': 'success',
            'data': similar
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/recommendations/trending', methods=['GET'])
def get_trending():
    """Get trending products"""
    try:
        limit = int(request.args.get('limit', 10))
        days = int(request.args.get('days', 7))
        trending = engine.get_trending_products(limit, days)
        return jsonify({
            'status': 'success',
            'data': trending
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/track/view', methods=['POST'])
def track_view():
    """Track product view"""
    try:
        data = request.json
        engine.track_view(data['userId'], data['productId'])
        return jsonify({
            'status': 'success',
            'message': 'View tracked'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/train', methods=['POST'])
def train_model():
    """Retrain recommendation models"""
    try:
        engine.train_models()
        return jsonify({
            'status': 'success',
            'message': 'Models trained successfully'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
