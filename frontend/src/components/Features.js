import React from 'react';

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Features
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L12 20l6-6-4.586-4.586a2 2 0 012.828 0L20 16l-8 8z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-3">Dataset Upload</h3>
              </div>
              <p className="text-gray-600">
                Seamlessly upload your gas usage datasets in CSV or Excel format. 
                Get an instant preview of your data including row count and column names.
              </p>
            </div>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-3">Data Cleaning</h3>
              </div>
              <p className="text-gray-600">
                Automatic preprocessing includes missing value removal, duplicate elimination, 
                and date formatting to ensure your data is ready for accurate analysis.
              </p>
            </div>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM9 18c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-3">Mathematical Analysis</h3>
              </div>
              <p className="text-gray-600">
                Apply proven mathematical models including Linear Regression, Moving Average, 
                and Exponential Smoothing to uncover patterns in your gas consumption data.
              </p>
            </div>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-3">Prediction Engine</h3>
              </div>
              <p className="text-gray-600">
                Generate accurate forecasts for daily, weekly, and monthly gas consumption 
                with confidence intervals and trend analysis.
              </p>
            </div>
          </div>
          
          {/* Feature 5 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM9 18c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-3">Dashboard Analytics</h3>
              </div>
              <p className="text-gray-600">
                Visualize your data with professional charts including line, bar, pie, area, 
                heatmap, and forecast graphs for comprehensive insights.
              </p>
            </div>
          </div>
          
          {/* Feature 6 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-3">Report Generation</h3>
              </div>
              <p className="text-gray-600">
                Export your analysis and predictions as PDF or Excel reports for sharing 
                with stakeholders or record keeping.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;