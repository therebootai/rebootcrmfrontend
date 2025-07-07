import { useEffect, useRef } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";

const SidePopUpSlider = ({ children, handleClose, showPopUp, clsprops }) => {
  const popUpRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popUpRef.current &&
        event.target instanceof Node &&
        !popUpRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose]);

  return (
    <div
      className={`fixed top-0 right-0 h-screen ${clsprops} w-[60%] overflow-hidden overflow-y-scroll no-scrollbar bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        showPopUp ? "translate-x-0" : "translate-x-full"
      }`}
      ref={popUpRef}
    >
      <div className="flex justify-end p-4 text-site-litegreen">
        <button onClick={handleClose}>
          <AiOutlineCloseCircle size={24} className="text-xl font-bold" />
        </button>
      </div>
      <div className="max-h-[90vh]">{children}</div>
    </div>
  );
};

export default SidePopUpSlider;
