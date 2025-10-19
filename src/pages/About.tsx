import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import teamPhoto from "@/assets/team-photo.jpeg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">About Our Team</h1>
            <p className="text-xl text-muted-foreground">Team ZIP Ties - FIRST Tech Challenge</p>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg">
            <img 
              src={teamPhoto} 
              alt="Team ZIP Ties" 
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-6 text-lg text-foreground">
            <p>
              Our team consists of highly energetic and curious high schoolers and middle schoolers 
              that are excited to be in their fifth season of FIRST Tech Challenge. We meet in a patio 
              three times a week. Our work strategy is to divide and conquer. We like to debate and 
              list pros and cons while we vote for the best ideas.
            </p>
            
            <p>
              Even though each of us are different and have various opinions, we all are bonded together 
              and work together because of one common interest: <span className="font-semibold text-primary">"FIRST Tech Challenge"</span>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
