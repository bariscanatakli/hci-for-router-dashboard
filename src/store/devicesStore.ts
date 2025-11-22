import { NetworkDevice } from "../lib/types/devices";

export interface DevicesState {
  devices: NetworkDevice[];
}

export const devicesStore: DevicesState = {
  devices: [],
};
