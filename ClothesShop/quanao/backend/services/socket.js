let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

// Function để emit notification cho admin
export const emitAdminNotification = (event, data) => {
  const io = getIO();
  if (io) {
    io.to("admin").emit(event, data);
  }
};

// Function để emit notification cho tất cả admin
export const emitReviewNotification = (notificationData) => {
  const io = getIO();
  if (io) {
    io.to("admin").emit("new_review_notification", notificationData);
  }
};
