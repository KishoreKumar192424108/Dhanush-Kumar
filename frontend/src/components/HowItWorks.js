import React from 'react';

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Upload Dataset</h3>
            <p className="text-gray-600">
              Upload your gas usage data in CSV or Excel format. The system will automatically 
              preview your data and check for any issues.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 011.946.806 3.42 3.42 0 004.732 0 3.42 3.42 0 011.946-.806 3.42 3.42 0 10-4.732 0 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806z"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Preprocess & Analyze</h3>
            <p className="text-gray-600">
              The system automatically cleans your data, handles missing values, and applies 
              mathematical models to identify patterns and trends in your gas consumption.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Predict & Visualize</h3>
            <p className="text-gray-600">
              Get accurate forecasts for future gas usage and view interactive charts that 
              help you understand consumption patterns and make informed decisions.
            </p>
          </div>
          
          {/* Step 4 */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Export Reports</h3>
            <p className="text-gray-600">
              Download comprehensive reports in PDF or Excel format to share insights with 
              stakeholders or keep for your records.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;