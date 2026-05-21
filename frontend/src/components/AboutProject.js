import React from 'react';

const AboutProject = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          About This Project
        </h2>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 lg:text-xl mb-8">
            Gas consumption prediction is crucial for efficient resource management, cost optimization, and environmental sustainability. 
            This system leverages mathematical analysis techniques to forecast future gas usage based on historical data patterns.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mathematical Foundation</h3>
              <p className="text-gray-600">
                Our prediction engine combines Linear Regression for trend identification, Moving Average for smoothing short-term fluctuations, 
                and Exponential Smoothing for capturing seasonal patterns in gas consumption data.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accurate Forecasting</h3>
              <p className="text-gray-600">
                By analyzing historical usage patterns, our models provide reliable daily, weekly, and monthly forecasts 
                with confidence intervals to help you plan ahead effectively.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Actionable Insights</h3>
              <p className="text-gray-600">
                Beyond simple predictions, our system identifies trends, seasonal variations, and anomalies 
                in your gas usage data, enabling data-driven decisions for optimization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutProject;