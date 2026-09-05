import { createAvatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import avatarJson from "./avatar.avatar.json";

const BaseMascot = createAvatar(avatarJson);

export default function AfaqMascot({
  size = 40,
  animation,
  expression,
  defaultAnimation = "idle",
  className = "",
  style = {},
  ...props
}) {
  const isControlled = animation !== undefined || expression !== undefined;

  return (
    <BaseMascot
      size={size}
      animation={animation}
      expression={expression}
      defaultAnimation={isControlled ? undefined : defaultAnimation}
      className={className}
      style={style}
      ariaLabel="AFAQ Club Mascot"
      {...props}
    />
  );
}
export { BaseMascot };
