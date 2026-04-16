import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import PickOfTheDayCard from './PickOfTheDayCard';
import { mockMatches } from '../../data/mockData';

const slides = [
  {
    headline: 'Predict. Stake. Win.',
    subline: 'Your Winning Streak Starts Here',
    bg: 'from-[#0D2B5E] to-[#1A4D8F]',
  },
  {
    headline: 'Every Match. Every Market.',
    subline: 'Corners, Goals, Cards — you call it.',
    bg: 'from-[#1A1A2E] to-[#0D2B5E]',
  },
  {
    headline: 'Take a Side. Win the Pride.',
    subline: 'Join thousands of winners on WinALot.',
    bg: 'from-[#0D2B5E] to-[#1A4D8F]',
  },
];

export default function HeroSlider() {
  const potd = mockMatches[0];

  return (
    <div className="relative">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="w-full"
        style={{ height: '500px' }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className={`w-full h-full bg-gradient-to-br ${slide.bg} relative overflow-hidden`}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" />
                <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-[#F5C518]" />
                <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white" />
              </div>

              <div className="absolute inset-0 bg-black/30" />

              <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
                  {/* Left text */}
                  <div>
                    <div className="inline-flex items-center bg-[#F5C518]/20 border border-[#F5C518]/40 rounded-full px-3 py-1 mb-4">
                      <span className="text-[#F5C518] text-xs font-bold uppercase tracking-widest">bWinALOTT</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
                      {slide.headline}
                    </h1>
                    <p className="text-lg text-blue-200 mb-6 max-w-md">{slide.subline}</p>
                    <div className="flex gap-3 flex-wrap">
                      <a href="/lobby" className="bg-[#F5C518] text-[#1A1A2E] font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all text-sm">
                        Browse Lobby
                      </a>
                      <a href="/how-to-play" className="border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:border-white transition-all text-sm">
                        How It Works
                      </a>
                    </div>
                  </div>

                  {/* Right: Pick of the Day card */}
                  <div className="hidden md:flex justify-center lg:justify-end">
                    <PickOfTheDayCard match={potd} />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
