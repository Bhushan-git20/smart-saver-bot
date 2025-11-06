import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    text: "FinanceAI has completely transformed how I manage my business finances. The AI insights are incredibly accurate and have saved me thousands of dollars!"
  },
  {
    name: "Michael Chen",
    role: "Freelance Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    text: "The investment recommendations are spot-on. I've seen a 25% increase in my portfolio returns since using FinanceAI. Absolutely game-changing!"
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Executive",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    rating: 5,
    text: "I love how easy it is to track expenses and set budget goals. The AI chatbot answers all my financial questions instantly. Best finance app I've ever used!"
  },
  {
    name: "David Park",
    role: "Software Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
    text: "The analytics and visual reports are outstanding. FinanceAI helps me understand my spending patterns and make smarter financial decisions every day."
  },
  {
    name: "Jessica Williams",
    role: "Content Creator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    rating: 5,
    text: "Finally, a finance app that's both powerful and easy to use! The receipt scanning feature alone has saved me hours of manual data entry."
  },
  {
    name: "Alex Turner",
    role: "Entrepreneur",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 5,
    text: "FinanceAI's AI-powered insights have helped me identify unnecessary expenses and optimize my cash flow. It's like having a personal financial advisor 24/7!"
  }
];

export const TestimonialsCarousel = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <Card className="h-full bg-card/50 backdrop-blur-sm border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <CardContent className="flex flex-col gap-4 p-6 h-full">
                    {/* Rating */}
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    {/* Testimonial Text */}
                    <p className="text-muted-foreground flex-grow leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    
                    {/* Author Info */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4" />
        <CarouselNext className="hidden md:flex -right-4" />
      </Carousel>
    </div>
  );
};
