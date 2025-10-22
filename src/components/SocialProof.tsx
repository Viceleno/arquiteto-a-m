import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Maria Silva",
    role: "Arquiteta",
    company: "Studio MS Arquitetura",
    avatar: "/avatars/maria.jpg",
    content: "O ArqCalc revolucionou meus cálculos de projeto. Economizo 2 horas por dia e tenho resultados mais precisos.",
    rating: 5,
    highlight: "Economiza 2h/dia"
  },
  {
    name: "João Santos",
    role: "Engenheiro Civil",
    company: "Construtora JS",
    avatar: "/avatars/joao.jpg",
    content: "Ferramenta essencial para qualquer profissional da construção. Interface intuitiva e cálculos confiáveis.",
    rating: 5,
    highlight: "Interface intuitiva"
  },
  {
    name: "Ana Costa",
    role: "Estudante de Arquitetura",
    company: "UFMG",
    avatar: "/avatars/ana.jpg",
    content: "Perfeito para aprender! As explicações didáticas me ajudaram muito durante a faculdade.",
    rating: 5,
    highlight: "Didático"
  }
];

const stats = [
  { number: "500+", label: "Profissionais Ativos" },
  { number: "10k+", label: "Cálculos Realizados" },
  { number: "99.9%", label: "Precisão Garantida" },
  { number: "4.9/5", label: "Avaliação Média" }
];

export const SocialProof = () => {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stat.number}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Testimonials */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
          O que nossos usuários dizem
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-gray-500">{testimonial.company}</div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    {testimonial.highlight}
                  </Badge>
                </div>
                
                <div className="flex items-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <div className="relative">
                  <Quote className="w-4 h-4 text-blue-200 absolute -top-1 -left-1" />
                  <p className="text-sm text-gray-700 italic pl-3">
                    "{testimonial.content}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-6 opacity-60">
          <div className="text-xs text-gray-500">✓ Seguro e Confiável</div>
          <div className="text-xs text-gray-500">✓ Baseado em Normas ABNT</div>
          <div className="text-xs text-gray-500">✓ Suporte 24/7</div>
        </div>
      </div>
    </div>
  );
};
