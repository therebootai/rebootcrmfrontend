import React, { useEffect, useRef } from "react";

const InfiniteScroll = ({ modalPage, fn, allModalPages }) => {
  const observerRef = useRef(null);

  useEffect(() => {
    if (allModalPages <= modalPage) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fn();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [modalPage]);

  return (
    <div
      ref={observerRef}
      className="xl:col-span-4 md:col-span-3 col-span-2 text-center py-4"
    />
  );
};

export default InfiniteScroll;
