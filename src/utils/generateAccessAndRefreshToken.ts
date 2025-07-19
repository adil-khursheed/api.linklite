import createHttpError from "http-errors";
import User from "../user/userModel";

export const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = createHttpError(404, "User not found");
      throw error;
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: true });

    return { accessToken, refreshToken };
  } catch (err) {
    const error = createHttpError(
      err instanceof Error
        ? err.message
        : "An unknown error occurred while generating tokens."
    );
    throw error;
  }
};
