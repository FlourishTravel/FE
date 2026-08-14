import floraAi from '../assets/flora/Flora-AI.png';

export const FLORA_AI_IMG = floraAi;

/** Ảnh nhân vật Flora AI (nền đen, object-contain). */
export default function FloraAvatar({ className, alt = 'Flora AI' }) {
  return <img src={floraAi} alt={alt} className={className} />;
}
