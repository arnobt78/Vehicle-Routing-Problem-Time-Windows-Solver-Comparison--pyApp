export interface DatasetInfo {
  name: string;
  txt_path: string;
  has_bks: boolean;
  bks_routes?: number[][];
  bks_cost?: number;
}
