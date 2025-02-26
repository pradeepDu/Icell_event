// animations.ts
import { gsap } from 'gsap';

export const setupDashboardAnimations = (
  dashboardRef: HTMLDivElement | null, 
  teamCardRefs: (HTMLDivElement | null)[]
) => {
  if (!dashboardRef) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Adjust animation parameters for mobile
  const isMobile = window.innerWidth < 640;
  const duration = prefersReducedMotion ? 0.3 : (isMobile ? 0.6 : 0.8);
  const staggerTime = prefersReducedMotion ? 0.05 : (isMobile ? 0.1 : 0.15);

  // Initial animation for the dashboard header
  gsap.from(dashboardRef, {
    y: prefersReducedMotion ? -10 : -30,
    opacity: 0,
    duration: duration,
    ease: "power3.out"
  });

  // Stagger animation for team cards
  gsap.fromTo(
    teamCardRefs.filter(Boolean),
    { 
      y: prefersReducedMotion ? 10 : 30, 
      opacity: 0,
      scale: prefersReducedMotion ? 0.98 : 0.95
    },
    { 
      y: 0, 
      opacity: 1,
      scale: 1,
      duration: duration * 0.75, 
      stagger: staggerTime,
      ease: "back.out(1.2)" 
    }
  );

  // Hover animations for team cards (disable on touch devices)
  if (!isMobile) {
    teamCardRefs.filter(Boolean).forEach(card => {
      card?.addEventListener('mouseenter', () => 
        gsap.to(card, { scale: 1.02, duration: 0.3 })
      );
      card?.addEventListener('mouseleave', () => 
        gsap.to(card, { scale: 1, duration: 0.3 })
      );
    });
  }
};

export const animateVoteSuccess = (teamCardRef: HTMLDivElement | null) => {
  if (!teamCardRef) return;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gsap.to(teamCardRef, { 
      scale: 1.02, 
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });
    return;
  }
  
  gsap.timeline()
    .to(teamCardRef, { 
      scale: 1.05, 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      duration: 0.3 
    })
    .to(teamCardRef, { 
      scale: 1, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      duration: 0.2,
      delay: 0.1
    });
};

export const animateResetVote = (teamCardRefs: (HTMLDivElement | null)[]) => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const staggerTime = prefersReducedMotion ? 0.05 : 0.1;
  
  gsap.to(teamCardRefs.filter(Boolean), {
    scale: 1,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    stagger: staggerTime,
    duration: 0.3
  });
};