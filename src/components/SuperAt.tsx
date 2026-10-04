import React from "react";
import { SUPERS, type SuperId } from "../copy";
import { at } from "../system/timeline";
import { Super, type SuperProps } from "./Type";

/** A super from the copy sheet, placed in screen space. */
export const SuperAt: React.FC<
  { id: SuperId } & Omit<SuperProps, "from" | "to" | "lines" | "mono" | "monoFrom">
> = ({ id, ...rest }) => {
  const s = SUPERS[id] as (typeof SUPERS)[SuperId] & { exit?: number; mono?: string; monoAt?: number };
  return (
    <Super
      from={at(s.at)}
      to={s.exit === undefined ? undefined : at(s.exit)}
      lines={s.lines}
      mono={s.mono}
      monoFrom={s.monoAt === undefined ? undefined : at(s.monoAt)}
      {...rest}
    />
  );
};
