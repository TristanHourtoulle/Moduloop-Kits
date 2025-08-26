import 'framer-motion';

declare module 'framer-motion' {
  // On déclare que motion.div est bien un div avec ses props HTML
  export const motion: {
    div: import('framer-motion').ForwardRefComponent<
      HTMLDivElement,
      import('react').HTMLAttributes<HTMLDivElement> &
        import('framer-motion').MotionProps
    >;
    // Si tu veux étendre aussi les autres tags :
    span: import('framer-motion').ForwardRefComponent<
      HTMLSpanElement,
      import('react').HTMLAttributes<HTMLSpanElement> &
        import('framer-motion').MotionProps
    >;
    section: import('framer-motion').ForwardRefComponent<
      HTMLElement,
      import('react').HTMLAttributes<HTMLElement> &
        import('framer-motion').MotionProps
    >;
    // Tu peux ajouter p, img, etc.
  };
}
