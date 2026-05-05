import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setVisible(current < lastY || current < 80);
      setLastY(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 md:hidden"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: visible ? 1 : 0.8,
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 16,
      }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
    >
      <Button
        type="button"
        data-ocid="fab.open_modal_button"
        onClick={onClick}
        className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        size="icon"
        aria-label="Create new task"
      >
        <motion.div
          animate={{ rotate: 0 }}
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.div>
      </Button>
    </motion.div>
  );
}
