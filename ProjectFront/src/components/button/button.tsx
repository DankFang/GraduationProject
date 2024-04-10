import style from "./button.module.scss";

export default function comButton({
  text,
  cancel,
  fontBold,
  noBg,
  buttonSize = "normal",
  onClickButton,
  loading = false,
  bgType = "bg1",
}: {
  text: string;
  cancel?: boolean;
  buttonSize?: string;
  onClickButton: Function;
  loading?: boolean;
  fontBold?: boolean;
  noBg?: boolean;
  bgType?: string;
}) {
  let width = "w-44",
    height = "h-9",
    fontSize = "text-base",
    rounded = "rounded-[8px]";
  switch (buttonSize) {
    case "big":
      (width = "w-52"), (height = "h-11"), (fontSize = "text-lg");
      break;
    case "sm":
      (width = "w-36"), (height = "h-7"), (fontSize = "text-sm");
      break;
    case "mint":
      (width = "w-[180px]"),
        (height = "h-[60px]"),
        (fontSize = "text-[24px]"),
        (rounded = "rounded-[25px]");
    default:
      break;
  }

  return (
    <div
      className={`${style.comButton} ${cancel ? style.cancelButton : ""} ${
        noBg ? style.noBgButton : ""
      } inline-block ${rounded} active:scale-95 ${fontSize} ${width} ${height} p-[2px]`}
    >
      <button
        className={`relative inline-block text-white ${
          fontBold ? "font-bold" : ""
        } ${rounded} w-[98%] h-[94%] ${loading ? "opacity-60" : ""} ${
          style[bgType]
        }`}
        disabled={loading}
        onClick={() => {
          onClickButton();
        }}
      >
        <span
          className={`flex items-center justify-center absolute ${style.text}`}
        >
          {loading ? (
            <i
              className={`${style.loading} inline-block iconfont icon-zhuangtaijiazai mr-2`}
            ></i>
          ) : null}
          {text}
        </span>
      </button>
    </div>
  );
}
