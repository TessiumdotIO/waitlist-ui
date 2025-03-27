
import React from 'react';
import { cn } from '@/lib/utils';
import { FadeIn } from './Animations';
import { Rocket, Star, Award, Users, Zap } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, delay = 0 }) => {
  return (
    <FadeIn 
      direction="up" 
      delay={delay} 
      className="group"
    >
      <div className="h-full p-8 rounded-2xl border border-border hover-scale bg-card/50 hover:bg-card transition-colors group-hover:shadow-lg">
        <div className="w-12 h-12 mb-5 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
          {icon}
        </div>
        
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </FadeIn>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      title: "Learn and Earn",
      description: "Complete courses and earn cryptocurrency rewards, creating a virtuous cycle of learning and earning.",
      icon: <Rocket className="h-6 w-6" />,
      delay: 100
    },
    {
      title: "Expert-Led Content",
      description: "Access courses created by industry experts and leading practitioners in the Web3 space.",
      icon: <Star className="h-6 w-6" />,
      delay: 200
    },
    {
      title: "Proof of Knowledge",
      description: "Earn verifiable credentials stored on blockchain, showcasing your expertise to employers.",
      icon: <Award className="h-6 w-6" />,
      delay: 300
    },
    {
      title: "Community Learning",
      description: "Join a vibrant community of learners and educators who are passionate about Web3.",
      icon: <Users className="h-6 w-6" />,
      delay: 400
    },
    {
      title: "Interactive Challenges",
      description: "Put your knowledge to the test with interactive coding challenges and scenarios.",
      icon: <Zap className="h-6 w-6" />,
      delay: 500
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="heading-lg mb-6">Revolutionizing Education in the Web3 Era</h2>
            <p className="text-lg text-muted-foreground">
              Our platform combines cutting-edge technology with proven educational methods, creating a 
              rewarding learning experience unlike any other.
            </p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={feature.delay}
            />
          ))}
        </div>
        
        <FadeIn direction="up" delay={600}>
          <div className="mt-20 p-8 rounded-2xl border border-border bg-card/30 backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0">
                <h3 className="text-4xl font-bold text-secondary mb-2">25K+</h3>
                <p className="text-muted-foreground text-center">Learners Enrolled</p>
              </div>
              
              <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0">
                <h3 className="text-4xl font-bold text-accent mb-2">150+</h3>
                <p className="text-muted-foreground text-center">Specialized Courses</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-4xl font-bold text-tertiary mb-2">2.5M</h3>
                <p className="text-muted-foreground text-center">Tokens Distributed</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Features;
