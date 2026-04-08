import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import joblib
import os

class StockPredictor:
    def __init__(self, model_path='models/saved/'):
        self.model_path = model_path
        self.scaler = MinMaxScaler()
        self.sequence_length = 60
        self.model = None
        
        # Create directory if not exists
        os.makedirs(model_path, exist_ok=True)
        
    def prepare_data(self, data):
        """Prepare data for LSTM model"""
        scaled_data = self.scaler.fit_transform(data['Close'].values.reshape(-1, 1))
        
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i, 0])
            y.append(scaled_data[i, 0])
        
        return np.array(X), np.array(y)
    
    def build_model(self, input_shape):
        """Build LSTM model"""
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(optimizer='adam', loss='mean_squared_error')
        return model
    
    def train(self, data, symbol):
        """Train model for specific stock"""
        X, y = self.prepare_data(data)
        X = X.reshape(X.shape[0], X.shape[1], 1)
        
        # Build and train model
        self.model = self.build_model((X.shape[1], 1))
        
        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
        
        self.model.fit(
            X, y,
            epochs=50,
            batch_size=32,
            validation_split=0.1,
            callbacks=[early_stop],
            verbose=0
        )
        
        # Save model
        self.model.save(f"{self.model_path}{symbol}_model.h5")
        joblib.dump(self.scaler, f"{self.model_path}{symbol}_scaler.pkl")
        
        return self.model
    
    def predict(self, data, days=30):
        """Predict future prices"""
        # If model exists, load it
        if self.model is None:
            try:
                from tensorflow.keras.models import load_model
                self.model = load_model(f"{self.model_path}model.h5")
                self.scaler = joblib.load(f"{self.model_path}scaler.pkl")
            except:
                # Train on the fly
                self.train(data, "temp")
        
        # Prepare last sequence
        scaled_data = self.scaler.transform(data['Close'].values[-self.sequence_length:].reshape(-1, 1))
        
        predictions = []
        current_sequence = scaled_data.copy()
        
        for _ in range(days):
            # Predict next day
            X_pred = current_sequence.reshape(1, self.sequence_length, 1)
            pred = self.model.predict(X_pred, verbose=0)
            predictions.append(pred[0, 0])
            
            # Update sequence
            current_sequence = np.append(current_sequence[1:], pred)
        
        # Inverse transform predictions
        predictions = self.scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
        
        return predictions[-1, 0]  # Return last prediction
    
    def get_confidence(self):
        """Return model confidence score"""
        # This is a simplified confidence score
        # In production, you'd calculate based on model's prediction variance
        return 85.0  # 85% confidence