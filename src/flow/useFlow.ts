import { useEffect, useState } from "react";
import { FlowCube, FlowResponse } from "./types";

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
  linkedQueries: Array<FlowCube>;
  previousResponse?: FlowResponse;
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
          // Parse iframeResponse if it exists
          let previousResponse: FlowResponse | undefined = undefined;
          if (data.iframeResponse) {
            try {
              previousResponse = JSON.parse(data.iframeResponse);
            } catch (error) {
              console.error('Failed to parse iframeResponse:', error);
            }
          }

          onLoadData({
            linkedQueries: data.connectedCubes,
            previousResponse,
          });
        }
        break;

      case FlowEvents.SAVE:
        let result: FlowResponse = {};
        if (onSave) {
          result = onSave();
        }

        // Build minimal response with only properties that have values
        const minimalResponse: FlowResponse = {};
        if (result.connectedCubesDescriptions && Object.keys(result.connectedCubesDescriptions).length > 0) {
          minimalResponse.connectedCubesDescriptions = result.connectedCubesDescriptions;
        }
        if (result.toolCubeDescriptions && Object.keys(result.toolCubeDescriptions).length > 0) {
          minimalResponse.toolCubeDescriptions = result.toolCubeDescriptions;
        }
        if (result.prompt) {
          minimalResponse.prompt = result.prompt;
        }
        if (result.plan) {
          minimalResponse.plan = result.plan;
        }

        if (window.top) {
          window.top.postMessage(
            {
              type: "set_parameter_value",
              value: JSON.stringify(minimalResponse),
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

