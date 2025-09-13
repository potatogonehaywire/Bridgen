from app import app, create_tables
from routes import *  # Import all routes

if __name__ == '__main__':
    # Initialize database tables
    create_tables()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5001, debug=True)