import { TimeOff, TimeOffStatus } from "../models/time-off";

export const createTimeOffService = async () => {};

export const approveTimeOffService = async ({ id }: { id: string }) => {
  const updatedTimeOff = await TimeOff.findByIdAndUpdate(
    id,
    {
      status: TimeOffStatus.APPROVED,
    },
    { new: true }
  );
  return updatedTimeOff;
};
