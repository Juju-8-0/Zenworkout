import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const upgradeMutation = useMutation({
    mutationFn: () => apiRequest("/api/upgrade-pro", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Welcome to ZenGym Pro! 🎉",
        description: "You now have access to all premium features.",
      });
      onClose();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upgrade Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleUpgrade = () => {
    setIsUpgrading(true);
    // Simulate payment processing
    setTimeout(() => {
      upgradeMutation.mutate();
      setIsUpgrading(false);
    }, 2000);
  };

  const proFeatures = [
    "Unlimited AI Chat with Zen Assistant",
    "Curated meal plans & recipes",
    "Advanced calorie tracker",
    "Premium workout routines",
    "Personalized daily affirmations",
    "Priority customer support",
    "Ad-free experience"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Crown className="h-6 w-6 text-yellow-500" />
            Upgrade to ZenGym Pro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2">
                <CardTitle className="text-2xl">$7.99</CardTitle>
                <Badge variant="secondary" className="text-xs">per month</Badge>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Most fitness apps charge $29+ per month
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-3">
            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading || upgradeMutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
            >
              {isUpgrading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Upgrade to ZenGym Pro
                </div>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Cancel anytime • Secure payment • 7-day money-back guarantee
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}