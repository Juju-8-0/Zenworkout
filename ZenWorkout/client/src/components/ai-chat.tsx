import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, Bot, User, Crown, Lock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import UpgradeModal from "./upgrade-modal";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
}

const sampleQuestions = [
  "What's a good high-protein breakfast?",
  "How many calories should I eat if I'm 160lbs and lifting 3x/week?",
  "What's a quick 20-minute core workout?",
  "Best post-workout meal for muscle recovery?",
  "How to stay motivated on rest days?"
];

export default function AIChat({ isOpen, onClose, isPro }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: aiStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/ai/check"],
    enabled: isOpen && !isPro
  });

  const askAIMutation = useMutation({
    mutationFn: (question: string) => 
      apiRequest("/api/ai/ask", { 
        method: "POST", 
        body: JSON.stringify({ question }),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + "-ai",
        type: 'ai',
        content: data.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      refetchStatus();
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
      if (error.message?.includes("limit reached")) {
        setShowUpgrade(true);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to get AI response",
          variant: "destructive"
        });
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    if (!isPro && aiStatus && !aiStatus.canAsk) {
      setShowUpgrade(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    askAIMutation.mutate(input.trim());
    setInput("");
  };

  const handleSampleQuestion = (question: string) => {
    if (!isPro && aiStatus && !aiStatus.canAsk) {
      setShowUpgrade(true);
      return;
    }
    setInput(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto h-[600px] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Ask Zen
              {isPro && <Crown className="h-4 w-4 text-yellow-500" />}
            </DialogTitle>
            
            {!isPro && aiStatus && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {aiStatus.questionsLeft} questions left today
                </Badge>
                {aiStatus.questionsLeft === 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => setShowUpgrade(true)}
                  >
                    Upgrade for unlimited
                  </Button>
                )}
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center space-y-4">
                <div className="text-center space-y-2">
                  <Bot className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="font-medium">Hi! I'm Zen, your fitness assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about fitness, nutrition, or wellness!
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">Try these questions:</p>
                  <div className="space-y-2">
                    {sampleQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start h-auto py-2 px-3 text-xs"
                        onClick={() => handleSampleQuestion(question)}
                        disabled={!isPro && aiStatus && !aiStatus.canAsk}
                      >
                        {!isPro && aiStatus && !aiStatus.canAsk && <Lock className="h-3 w-3 mr-1" />}
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                    
                    <Card className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </CardContent>
                    </Card>

                    {message.type === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {askAIMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
                          <span className="text-sm text-muted-foreground">Zen is thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="flex-shrink-0 flex gap-2 pt-4 border-t">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={!isPro && aiStatus && !aiStatus.canAsk ? "Upgrade to ask more questions" : "Ask Zen anything..."}
                onKeyPress={handleKeyPress}
                disabled={askAIMutation.isPending || (!isPro && aiStatus && !aiStatus.canAsk)}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || askAIMutation.isPending || (!isPro && aiStatus && !aiStatus.canAsk)}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
      />
    </>
  );
}

// Floating AI Chat Button
interface AIChatButtonProps {
  onClick: () => void;
  isPro: boolean;
}

export function AIChatButton({ onClick, isPro }: AIChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 z-50"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}