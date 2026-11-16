export type CheckAction = {
  key: string;
  label: string;
  onPress: () => void;
};

export type CheckView = {
  lines: readonly string[];
  actions: readonly CheckAction[];
};
