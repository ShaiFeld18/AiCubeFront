import { useEffect, useState } from "react";
import { FlowCube, FlowResponse } from "./types";
import { FlowResponseBuilder } from "./FlowResponseBuilder";

enum FlowEvents {
  SEND_DATA = "send_iframe_data",
  SAVE = "save_parameter_value",
  CANCEL = "cancel_parameter_value",
}

type UseFlowProps = {
  onLoadData?: (data: LoadDataParams) => void;
  onSave?: () => FlowResponse;
  onCancel?: () => void;
};

export type LoadDataParams = {
  response: FlowResponseBuilder;
  linkedQueries: Array<FlowCube>;
  username: string;
  value: FlowResponse;
};

export const useFlow = ({ onLoadData, onSave, onCancel }: UseFlowProps) => {
  const [loaded, setLoaded] = useState(false);

  const loadIframe = () => {
    if (window.top != null)
      window.top.postMessage({ type: "iframe_is_ready" }, "*");
  };

  const eventHandler = async (event: MessageEvent) => {
    const data = event.data;
    switch (data.type) {
      case FlowEvents.SEND_DATA:
        if (onLoadData) {
          const flowResponseBuilder = new FlowResponseBuilder().loadFromObject(
            data.query
          );
          onLoadData({
            response: flowResponseBuilder,
            linkedQueries: data.connectedCubes,
            username: data.userName,
            value: data.value,
          });
        }
        break;

      case FlowEvents.SAVE:
        let result: FlowResponse = new FlowResponseBuilder().build();
        if (onSave) {
          result = onSave();
        }

        if (window.top) {
          window.top.postMessage(
            {
              type: "set_parameter_value",
              value: JSON.stringify(result),
            },
            "*"
          );
        }
        break;

      case FlowEvents.CANCEL:
        if (onCancel) {
          onCancel();
        }
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("message", eventHandler);

    if (!loaded) {
      loadIframe();
      setLoaded(true);
    }

    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, [onLoadData, onSave, onCancel]);
};

