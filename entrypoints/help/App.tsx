import React from "react";


const App: React.FC = () => {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl p-8 mx-auto space-y-8 bg-white shadow-xl rounded-xl">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-800">
            Job Apply Pro
          </h1>
          <p className="mb-8 text-xl text-slate-600">
            Your Automated Job Application Assistant
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section className="text-center">
            <h2 className="mb-4 text-2xl font-semibold text-slate-700">
              Overview
            </h2>
            <p className="max-w-2xl mx-auto">
              Job Apply Pro is a Chrome extension that streamlines your LinkedIn
              job application process. It intelligently automates repetitive
              tasks while giving you full control over your applications.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-center text-slate-700">
              Getting Started
            </h2>
            <div className="max-w-2xl mx-auto">
              <ol className="pl-5 space-y-3 list-decimal">
                <li>
                  Navigate to LinkedIn and search for jobs that match your
                  interests
                </li>
                <li>
                  Look for the Job Apply Pro floating button on the right side
                  of your screen
                </li>
                <li>
                  Click "Start" to begin the automated application process
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-center text-slate-700">
              How Auto-Apply Works
            </h2>
            <div className="max-w-2xl mx-auto">
              <ol className="pl-5 space-y-3 list-decimal">
                <li>
                  The extension processes each job listing in your search
                  results
                </li>
                <li>
                  It automatically fills forms using your previously saved
                  responses
                </li>
                <li>For new questions, it pauses and waits for your input</li>
                <li>
                  Your responses are securely saved for future applications
                </li>
                <li>
                  After completing an application, it moves to the next job
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-center text-slate-700">
              Controls
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-slate-50">
                  <h3 className="mb-2 font-semibold text-slate-700">
                    Start/Resume
                  </h3>
                  <p className="text-slate-600">
                    Begin auto-applying or continue from where you left off
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50">
                  <h3 className="mb-2 font-semibold text-slate-700">Pause</h3>
                  <p className="text-slate-600">
                    Temporarily stop the automation process
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50">
                  <h3 className="mb-2 font-semibold text-slate-700">Skip</h3>
                  <p className="text-slate-600">
                    Move to the next job in the list
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50">
                  <h3 className="mb-2 font-semibold text-slate-700">Stop</h3>
                  <p className="text-slate-600">
                    End the automation process completely
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-center text-slate-700">
              Tips for Success
            </h2>
            <div className="max-w-2xl mx-auto">
              <ul className="pl-5 space-y-3 list-disc">
                <li>
                  Review job descriptions carefully before starting auto-apply
                </li>
                <li>
                  Keep your responses professional and tailored to the position
                </li>
                <li>Double-check your answers when the extension pauses</li>
                <li>Use the pause feature if you need more time to review</li>
              </ul>
            </div>
          </section>
        </div>

        <footer className="pt-6 mt-12 text-center border-t text-slate-500">
          <p>Need more help? Contact support at support@jobapplypro.com</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
