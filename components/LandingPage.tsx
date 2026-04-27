import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const Sparkle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute w-1.5 h-1.5 rounded-full bg-teal-300"
    style={{
      ...style,
      animation: `sparkle ${2 + Math.random() * 3}s ease-in-out infinite`,
      animationDelay: `${Math.random() * 4}s`,
    }}
  />
);

const FeatureCard: React.FC<{ icon: string; title: string; description: string; delay: string; accentColor: string }> = ({ icon, title, description, delay, accentColor }) => (
  <div
    className="glass-card card-glow-effect p-6 animate-[slideInUp_0.7s_ease-out] opacity-0 hover:-translate-y-3 group"
    style={{ animationDelay: delay, animationFillMode: 'forwards' }}
  >
    <div
      className="flex items-center justify-center h-14 w-14 rounded-xl mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
      style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`, border: `1px solid ${accentColor}33` }}
    >
      <i className={`fas ${icon} text-xl`} style={{ color: accentColor }}></i>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2 font-heading">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

const StatBadge: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="glass-card-static px-4 py-3 flex items-center gap-3 animate-[fadeIn_1s_ease-out]" style={{ animationDelay: '1s', animationFillMode: 'forwards', opacity: 0 }}>
    <i className={`fas ${icon} text-teal-400`}></i>
    <div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-300">{value}</p>
    </div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const sparklePositions = [
    { top: '10%', left: '15%' }, { top: '20%', right: '20%' }, { top: '35%', left: '8%' },
    { top: '60%', right: '12%' }, { top: '75%', left: '25%' }, { top: '15%', left: '45%' },
    { top: '45%', right: '30%' }, { top: '80%', right: '35%' }, { top: '5%', right: '40%' },
    { top: '55%', left: '5%' }, { top: '90%', left: '40%' }, { top: '30%', right: '8%' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
      {/* Sparkles */}
      {sparklePositions.map((pos, i) => (
        <Sparkle key={i} style={pos as React.CSSProperties} />
      ))}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Hero Section */}
        <header className="mb-16 animate-[fadeIn_1s_ease-out]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card-static px-4 py-2 mb-8 text-xs text-gray-400 animate-[slideInDown_0.6s_ease-out]">
            <i className="fas fa-sparkles text-teal-400"></i>
            <span>Powered by Gemini AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 font-heading">
            <span className="text-white">Meet Your </span>
            <span className="gradient-text">Personal</span>
            <br />
            <span className="gradient-text">AI Therapist</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            A private, safe space to understand your thoughts and feelings.
            Get real-time insights, mood analysis, and personalized guidance — whenever you need it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="glow-button px-10 py-4 text-white font-semibold rounded-2xl text-lg ripple"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <i className="fas fa-arrow-right text-sm"></i>
              </span>
            </button>
            <span className="text-sm text-gray-500">No sign-up required</span>
          </div>
        </header>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 animate-[slideInUp_0.7s_ease-out]" style={{ animationDelay: '400ms', animationFillMode: 'forwards', opacity: 0 }}>
          <StatBadge icon="fa-brain" label="AI Model" value="Gemini 2.5 Flash" />
          <StatBadge icon="fa-shield-alt" label="Privacy" value="100% Local Data" />
          <StatBadge icon="fa-camera" label="Facial Analysis" value="Real-time" />
        </div>

        {/* Feature Cards */}
        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="fa-brain"
              title="Understand Your Thoughts"
              description="Our AI gently explores your feelings and provides real-time mood analysis, sentiment scoring, and subject detection."
              delay="500ms"
              accentColor="#2DD4BF"
            />
            <FeatureCard
              icon="fa-chart-line"
              title="Track Your Wellness"
              description="See patterns in your emotional well-being over time through interactive charts, mood logs, and biometric tracking."
              delay="650ms"
              accentColor="#818CF8"
            />
            <FeatureCard
              icon="fa-lightbulb"
              title="Get Personalized Advice"
              description="Receive music, podcast, exercise, and activity recommendations tailored to your current mood and state."
              delay="800ms"
              accentColor="#38BDF8"
            />
          </div>
        </main>

        {/* Bottom Tagline */}
        <p className="mt-16 text-xs text-gray-600 animate-[fadeIn_1s_ease-out]" style={{ animationDelay: '1.2s', animationFillMode: 'forwards', opacity: 0 }}>
          <i className="fas fa-lock mr-1"></i> Your conversations stay on your device. Haven never stores your data externally.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;