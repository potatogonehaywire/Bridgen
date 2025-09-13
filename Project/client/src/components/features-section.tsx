export default function FeaturesSection() {
  const features = [
    {
      id: 'mentorship-circles',
      icon: '👥',
      title: 'MENTORSHIP CIRCLES',
      description: 'Guided small-group learning experiences where knowledge flows both ways',
      color: 'primary'
    },
    {
      id: 'skill-swaps',
      icon: '🔄',
      title: 'SKILL SWAPS',
      description: 'Teach what you know, learn what you don\'t in our peer-to-peer exchanges',
      color: 'secondary'
    },
    {
      id: 'storytelling',
      icon: '📚',
      title: 'STORYTELLING',
      description: 'A library of wisdom and personal experiences shared across generations',
      color: 'accent'
    },
    {
      id: 'collaborative-projects',
      icon: '🤝',
      title: 'COLLABORATIVE PROJECTS',
      description: 'Join forces on creative and practical tasks that bridge generations',
      color: 'destructive'
    },
    {
      id: 'workshops',
      icon: '🎓',
      title: 'WORKSHOPS',
      description: 'Structured, interactive events designed for collaborative learning',
      color: 'primary'
    },
    {
      id: 'social-spaces',
      icon: '💬',
      title: 'SOCIAL SPACES',
      description: 'Safe, casual conversations in our welcoming community rooms',
      color: 'secondary'
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6" data-testid="text-features-title">
            EXPLORE BRIDGEN'S KEY FEATURES
          </h2>
          <p className="text-xl text-muted-foreground">Everything you need to connect and learn</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={`arcade-button bg-card rounded-lg p-8 text-center border-2 border-${feature.color} hover:border-${feature.color} hover:glow cursor-pointer`}
              data-testid={`card-feature-${feature.id}`}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className={`font-arcade text-${feature.color} text-sm mb-4`}>{feature.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
