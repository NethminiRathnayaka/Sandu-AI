import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SanduExpression } from '../../store/useAppStore';

interface SanduAvatarProps {
  expression?: SanduExpression;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  outfitColor?: string;
  isSpeaking?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SanduAvatar: React.FC<SanduAvatarProps> = ({
  expression = 'idle',
  size = 'md',
  outfitColor = '#6366f1',
  isSpeaking = false,
  className = '',
  onClick
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  // Blinking loop every 3.5 - 5 seconds
  useEffect(() => {
    if (expression === 'sleepy') return;

    let timeoutId: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
      const nextInterval = 3000 + Math.random() * 2500;
      timeoutId = setTimeout(triggerBlink, nextInterval);
    };

    timeoutId = setTimeout(triggerBlink, 3200);
    return () => clearTimeout(timeoutId);
  }, [expression]);

  // Mouth talking animation when speaking or talking expression
  useEffect(() => {
    if (isSpeaking || expression === 'talking') {
      const interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 140);
      return () => clearInterval(interval);
    } else {
      setMouthOpen(false);
    }
  }, [isSpeaking, expression]);

  // Size configurations
  const dimensions = {
    sm: { width: 48, height: 48, viewBox: '0 0 512 512' },
    md: { width: 120, height: 120, viewBox: '0 0 512 512' },
    lg: { width: 220, height: 220, viewBox: '0 0 512 512' },
    xl: { width: 320, height: 320, viewBox: '0 0 512 512' }
  }[size];

  // Head tilt based on expression
  const headRotation = {
    idle: 0,
    happy: 2,
    thinking: -6,
    talking: 1,
    celebrating: 4,
    encouraging: -2,
    sleepy: 5,
    surprised: 0
  }[expression];

  return (
    <motion.div
      onClick={onClick}
      className={`relative select-none inline-flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      animate={{
        y: expression === 'celebrating' ? [0, -12, 0] : expression === 'sleepy' ? [0, 4, 0] : [0, -6, 0],
        rotate: [headRotation - 0.5, headRotation + 0.5, headRotation - 0.5]
      }}
      transition={{
        y: { duration: expression === 'celebrating' ? 0.6 : 3.5, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={dimensions.viewBox}
        className="overflow-visible drop-shadow-md"
      >
        <defs>
          <linearGradient id={`hairGrad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2d2222" />
            <stop offset="100%" stop-color="#191313" />
          </linearGradient>
          <radialGradient id={`eyeGrad-${size}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#818cf8" />
            <stop offset="60%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </radialGradient>
        </defs>

        {/* Back Hair */}
        <motion.path
          d="M 150 220 C 120 330 135 400 165 440 C 220 450 292 450 347 440 C 377 400 392 330 362 220 Z"
          fill={`url(#hairGrad-${size})`}
          animate={{ skewX: [-1, 1, -1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* School Uniform Body */}
        <g id="body">
          {/* White shirt body */}
          <path d="M 175 425 Q 256 460 337 425 L 380 512 L 132 512 Z" fill="#ffffff" />
          
          {/* Uniform sailor collar in outfit accent color */}
          <path
            d="M 195 435 L 256 492 L 317 435 L 290 425 L 256 455 L 222 425 Z"
            fill={outfitColor}
          />
          
          {/* Cute pink tie ribbon */}
          <polygon points="244,480 256,468 268,480 262,498 256,488 250,498" fill="#f43f5e" />
        </g>

        {/* Neck */}
        <path d="M 230 350 L 282 350 L 286 422 L 226 422 Z" fill="#fed7aa" />

        {/* Face / Head */}
        <g id="face">
          <ellipse cx="256" cy="280" rx="90" ry="100" fill="#fff1e6" />
          <path d="M 178 280 C 178 370 256 395 256 395 C 256 395 334 370 334 280 C 334 200 178 200 178 280 Z" fill="#fff1e6" />

          {/* Rosy Anime Blushes */}
          <ellipse cx="202" cy="320" rx="16" ry="8" fill="#fda4af" opacity={expression === 'happy' || expression === 'celebrating' ? 0.9 : 0.6} />
          <ellipse cx="310" cy="320" rx="16" ry="8" fill="#fda4af" opacity={expression === 'happy' || expression === 'celebrating' ? 0.9 : 0.6} />
          {(expression === 'happy' || expression === 'celebrating') && (
            <>
              {/* Blush hash lines */}
              <line x1="196" y1="316" x2="200" y2="324" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
              <line x1="204" y1="316" x2="208" y2="324" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
              <line x1="304" y1="316" x2="308" y2="324" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
              <line x1="312" y1="316" x2="316" y2="324" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            </>
          )}

          {/* EYES */}
          {/* Sleepy / Closed Eyes */}
          {expression === 'sleepy' || isBlinking ? (
            <g id="closed-eyes">
              {/* Left eye sleepy curve */}
              <path d="M 194 285 Q 215 295 236 285" fill="none" stroke="#231b1b" strokeWidth="5" strokeLinecap="round" />
              {/* Right eye sleepy curve */}
              <path d="M 276 285 Q 297 295 318 285" fill="none" stroke="#231b1b" strokeWidth="5" strokeLinecap="round" />
              {/* Sleep 'zZ' when sleepy */}
              {expression === 'sleepy' && (
                <text x="325" y="240" fill="#a5b4fc" fontSize="26" fontWeight="bold">zZ</text>
              )}
            </g>
          ) : expression === 'happy' || expression === 'celebrating' ? (
            /* Joyful anime crescent eyes */
            <g id="joyful-eyes">
              <path d="M 194 288 Q 215 268 236 288" fill="none" stroke="#231b1b" strokeWidth="5" strokeLinecap="round" />
              <path d="M 276 288 Q 297 268 318 288" fill="none" stroke="#231b1b" strokeWidth="5" strokeLinecap="round" />
            </g>
          ) : (
            /* Open anime eyes with spark */
            <g id="open-eyes">
              {/* Left Eye */}
              <ellipse cx="215" cy="285" rx="19" ry="25" fill={`url(#eyeGrad-${size})`} />
              <circle cx="210" cy="275" r="7" fill="#ffffff" />
              <circle cx="221" cy="295" r="3.5" fill="#ffffff" />
              <path d="M 192 273 Q 215 255 238 273" fill="none" stroke="#231b1b" strokeWidth="4.5" strokeLinecap="round" />

              {/* Right Eye */}
              <ellipse cx="297" cy="285" rx="19" ry="25" fill={`url(#eyeGrad-${size})`} />
              <circle cx="292" cy="275" r="7" fill="#ffffff" />
              <circle cx="303" cy="295" r="3.5" fill="#ffffff" />
              <path d="M 274 273 Q 297 255 320 273" fill="none" stroke="#231b1b" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}

          {/* EYEBROWS */}
          {expression === 'thinking' ? (
            <>
              {/* Left eyebrow raised */}
              <path d="M 195 240 Q 215 232 234 242" fill="none" stroke="#372f2f" strokeWidth="3.5" strokeLinecap="round" />
              {/* Right eyebrow furrowed */}
              <path d="M 278 248 Q 297 246 317 242" fill="none" stroke="#372f2f" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : expression === 'encouraging' ? (
            <>
              <path d="M 197 246 Q 215 240 233 246" fill="none" stroke="#372f2f" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 279 246 Q 297 240 315 246" fill="none" stroke="#372f2f" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : expression === 'surprised' ? (
            <>
              <path d="M 195 235 Q 215 228 235 235" fill="none" stroke="#372f2f" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 277 235 Q 297 228 317 235" fill="none" stroke="#372f2f" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M 197 248 Q 215 240 233 248" fill="none" stroke="#372f2f" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 279 248 Q 297 240 315 248" fill="none" stroke="#372f2f" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {/* Cute Nose */}
          <circle cx="256" cy="308" r="2" fill="#d97706" />

          {/* MOUTH */}
          {mouthOpen ? (
            /* Open talking / cheering mouth */
            <path d="M 243 328 Q 256 348 269 328 Z" fill="#b91c1c" />
          ) : expression === 'surprised' ? (
            <ellipse cx="256" cy="332" rx="7" ry="10" fill="#b91c1c" />
          ) : expression === 'thinking' ? (
            <path d="M 248 333 Q 256 333 264 330" fill="none" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
          ) : (
            /* Sweet natural anime smile */
            <path d="M 245 329 Q 256 342 267 329" fill="none" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>

        {/* Front Hair with Bangs & Hairpin */}
        <g id="hair-front">
          <path
            d="M 164 260 C 160 170 210 140 256 140 C 302 140 352 170 348 260 C 330 220 310 200 290 220 C 275 190 260 210 256 225 C 248 190 230 195 218 220 C 200 200 180 225 164 260 Z"
            fill={`url(#hairGrad-${size})`}
          />

          {/* Side Bangs */}
          <path d="M 166 235 Q 160 300 178 340 Q 182 280 174 240 Z" fill={`url(#hairGrad-${size})`} />
          <path d="M 346 235 Q 352 300 334 340 Q 330 280 338 240 Z" fill={`url(#hairGrad-${size})`} />

          {/* Hairpin / Ribbon on left side */}
          <g transform="translate(185, 175) rotate(-20)">
            <circle cx="0" cy="0" r="9" fill="#ec4899" />
            <polygon points="-5,-4 -18,-15 -20,2" fill="#f43f5e" />
            <polygon points="5,-4 18,-15 20,2" fill="#f43f5e" />
            <circle cx="0" cy="0" r="4" fill="#fde047" />
          </g>
        </g>

        {/* Celebrating Sparkles & Confetti Effect */}
        {expression === 'celebrating' && (
          <g id="sparkles">
            <polygon points="390,130 395,145 410,150 395,155 390,170 385,155 370,150 385,145" fill="#fde047" opacity="0.9" />
            <polygon points="110,160 113,170 123,173 113,177 110,187 107,177 97,173 107,170" fill="#f43f5e" opacity="0.9" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};
