import { SecurityProfile } from "../types/security";

export async function fetchSecurityProfile(): Promise<SecurityProfile | null> {
  return null;
}

export async function updateSecurityProfile(profile: SecurityProfile): Promise<boolean> {
  void profile;
  return false;
}
