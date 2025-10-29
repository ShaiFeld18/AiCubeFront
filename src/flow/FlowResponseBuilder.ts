import { FlowResponse, IField, IFlowParameter } from "./types";

export class FlowResponseBuilder {
  private parameters: Partial<IFlowParameter>[] = [];
  private fields: IField[] = [];
  private displayName: string = '';
  private iframeFieldsToFilter: { [key: string]: string } = {};

  public loadFromObject(flowResponse: Partial<FlowResponse>): FlowResponseBuilder {
    if (flowResponse.Parameters) {
      this.parameters = flowResponse.Parameters.map((parameter) => ({ ...parameter }));
    }

    if (flowResponse.Fields) {
      this.fields = flowResponse.Fields.map((field) => ({ ...field }));
    }

    if (flowResponse.DisplayName) {
      this.displayName = flowResponse.DisplayName;
    }

    if (flowResponse.iframeFieldsToFilter) {
      this.iframeFieldsToFilter = { ...flowResponse.iframeFieldsToFilter };
    }

    return this;
  }

  public addParameter(
    name: string,
    displayName: string,
    type: IFlowParameter["Type"],
    value: any,
    options?: Partial<Omit<IFlowParameter, "Name" | "DisplayName" | "Type" | "Value">>
  ): FlowResponseBuilder {
    const defaultParameters = {
      HiddenFromUser: true,
      Description: null,
      IsSingleValue: true,
      IsRequired: true,
      AutoCompleteProviders: undefined,
      OptionsProviders: undefined,
      Options: undefined,
      Category: null,
      ParameterSubtitle: null,
      Visible: false,
    }

    const parameter: Partial<IFlowParameter> = {
      ...defaultParameters,
      ...options,
      Name: name,
      DisplayName: displayName,
      Type: type,
      Value: value,
    };

    this.parameters.push(parameter);
    return this;
  }

  public addField(name: string, displayName: string, type: IField["Type"]): FlowResponseBuilder {
    const field: IField = {
      Name: name,
      DisplayName: displayName,
      Type: type,
    };
    this.fields.push(field);
    return this;
  }

  public setDisplayName(displayName: string): FlowResponseBuilder {
    this.displayName = displayName;
    return this;
  }

  public addIframeFieldToFilter(fieldName: string, filterValue: string): FlowResponseBuilder {
    this.iframeFieldsToFilter[fieldName] = filterValue;
    return this;
  }

  public getParameterValue(name: string): any {
    const parameter = this.parameters.find((param) => param.Name === name);
    return parameter ? parameter.Value : undefined;
  }

  public build(): FlowResponse {
    return {
      Parameters: this.parameters,
      Fields: this.fields,
      DisplayName: this.displayName,
      iframeFieldsToFilter: this.iframeFieldsToFilter,
    };
  }
}

