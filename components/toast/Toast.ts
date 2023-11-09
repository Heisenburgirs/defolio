// notify.ts
import { toast, Slide } from 'react-toastify';

export const notify = (message: string, type: NotificationType = NotificationType.Default) => {
  const options = {
    position: toast.POSITION.BOTTOM_RIGHT, // default position
  };

  switch (type) {
    case NotificationType.Success:
      toast.success(message, {
        ...options,
        position: toast.POSITION.BOTTOM_RIGHT,
        transition: Slide,
        hideProgressBar: true,
        autoClose: 1500,
        style: {
          backgroundColor: 'white', // success green, for example
          color: '#8993d1',
          fontWeight: 'bold',
          fontSize: '16px',
          borderRadius: '15px',
          padding: '16px',
        },
      });
      break;
    case NotificationType.Error:
      toast.error(message, { ...options, position: toast.POSITION.TOP_LEFT });
      break;
    case NotificationType.Warning:
      toast.warn(message, { ...options, position: toast.POSITION.BOTTOM_LEFT });
      break;
    case NotificationType.Info:
      toast.info(message, { ...options, position: toast.POSITION.BOTTOM_CENTER });
      break;
    default:
      toast(message, options);
  }
};
