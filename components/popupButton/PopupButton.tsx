import { formatAddress } from "@/app/utils/useFormatAddress";
import { useEffect, useState } from "react";

export const PopupButton = ({ isVisible, onReset, onConfirm, controllerAddresses } : { isVisible: boolean, onReset: () => void, onConfirm: () => void, controllerAddresses: string[] }) => {
  const visibilityClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
  const transitionClass = 'transition ease-in-out duration-500';

  const [addresses, setAddresses] = useState<string[]>()

  useEffect(() => {
    if (controllerAddresses.length != 0) {
      setAddresses(controllerAddresses)
    }
  }, [controllerAddresses]);

  return (
    <div className={`fixed bottom-0 right-0 z-50 flex w-auto h-auto py-8 px-8 ${visibilityClass} ${transitionClass}`}>
        <div className="flex flex-col gap-4 py-4 px-8 bg-white rounded-15 border-4 border-double border-lightPurple">
        <span className="font-bold text-purple">
          Permissions Changed For:
        </span>

        <div className="flex flex-col gap-2">
          {addresses?.map((controller, index) => (
          <div key={index} className="text-lightPurple font-bold flex w-full justify-center">
            {controller ? formatAddress(controller) : "0x00"}
          </div>

          ))}
        </div>
        <div className="flex gap-4 items-center justify-between">
          <button
            className="py-1 px-4 rounded-10 border border-Lightpurple text-lightPurple hover:bg-purple hover:text-white hover:cursor-pointer transition"
            onClick={onReset}
          >
            Reset
          </button>
          <button
            className="py-1 px-4 rounded-10 border border-Lightpurple bg-purple text-white scale-100 hover:scale-105 hover:cursor-pointer transition"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}