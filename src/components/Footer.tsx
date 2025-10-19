import { Mail, Globe } from "lucide-react";
import teamLogo from "@/assets/team-logo.svg";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start gap-4">
            <img src={teamLogo} alt="Team Zip Ties" className="h-20 w-auto" />
            <p className="text-sm text-muted-foreground">
              Professional stock prediction platform powered by advanced AI algorithms
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:teamzipties@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                teamzipties@gmail.com
              </a>
              <a
                href="https://teamzipties.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <Globe className="h-4 w-4" />
                teamzipties.com
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <p className="text-sm text-muted-foreground">
              Built by team Z.I.P Ties.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Team Zip Ties. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};