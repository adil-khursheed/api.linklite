import createHttpError from "http-errors";
import User from "../user/userModel";

export const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = createHttpError(404, "User not found");
      throw error;
    }
    const access_token = user.generateAccessToken();
    const refresh_token = user.generateRefreshToken();

    user.refresh_token = refresh_token;

    await user.save({ validateBeforeSave: true });

    return { access_token, refresh_token };
  } catch (err) {
    const error = createHttpError(
      err instanceof Error
        ? err.message
        : "An unknown error occurred while generating tokens."
    );
    throw error;
  }
};
