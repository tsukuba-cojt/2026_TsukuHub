/**
 * 大阪大学 11学部 卒業要件データ
 *
 * 根拠: CELAS「履修の手引」2026 + 各学部便覧
 */

import type { GradRequirementTable } from "../../core/types";
import { dentistryRequirements } from "./requirements/dentistry";
import { economicsRequirements } from "./requirements/economics";
import { engineeringRequirements } from "./requirements/engineering";
import { fengRequirements } from "./requirements/feng";
import { humanitiesRequirements } from "./requirements/humanities";
import { lawRequirements } from "./requirements/law";
import { medicineRequirements } from "./requirements/medicine";
import { pharmacyRequirements } from "./requirements/pharmacy";
import { scienceRequirements } from "./requirements/science";

export const osakaRequirements: GradRequirementTable = {
  ...humanitiesRequirements,
  ...lawRequirements,
  ...economicsRequirements,
  ...scienceRequirements,
  ...medicineRequirements,
  ...dentistryRequirements,
  ...pharmacyRequirements,
  ...engineeringRequirements,
  ...fengRequirements,
};

export const gradRequirementData = osakaRequirements;
