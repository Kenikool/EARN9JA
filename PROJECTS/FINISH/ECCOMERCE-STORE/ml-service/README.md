# ML Recommendation Service

Python-based machine learning service for product recommendations using scikit-learn.

## Features

- **Collaborative Filtering**: Recommendations based on user purchase history
- **Content-Based Filtering**: Similar products based on product features
- **Trending Products**: Popular products based on recent activity
- **View Tracking**: Track user behavior for better recommendations

## Setup

1. Install Python 3.8+

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update MongoDB URI in `.env`

5. Run the service:
```bash
python app.py
```

The service will run on `http://localhost:5000`

## API Endpoints

- `GET /health` - Health check
- `GET /recommendations/user/<user_id>?limit=10` - Get personalized recommendations
- `GET /recommendations/similar/<product_id>?limit=10` - Get similar products
- `GET /recommendations/trending?limit=10&days=7` - Get trending products
- `POST /track/view` - Track product view
- `POST /train` - Retrain models

## Technology Stack

- **Flask**: Web framework
- **scikit-learn**: Machine learning library
- **pandas**: Data manipulation
- **numpy**: Numerical computing
- **pymongo**: MongoDB driver

## Algorithms Used

1. **Collaborative Filtering**: 
   - User-based recommendations
   - "Users who bought X also bought Y"

2. **Content-Based Filtering**:
   - TF-IDF vectorization
   - Cosine similarity

3. **Trending Algorithm**:
   - Weighted scoring (purchases + views)
   - Time-based filtering
