import { getHrSettingsController } from './get-hr-settings';
import { updateHrSettingsController } from './update-hr-settings';
import type { GetHrSettingsControllerResult } from './get-hr-settings';
import type { UpdateHrSettingsControllerResult } from './update-hr-settings';

export async function getHrSettingsRouteController(
    request: Request,
): Promise<GetHrSettingsControllerResult> {
    const result = await getHrSettingsController(request);
    return result;
}

export async function updateHrSettingsRouteController(
    request: Request,
): Promise<UpdateHrSettingsControllerResult> {
    const result = await updateHrSettingsController(request);
    return result;
}
