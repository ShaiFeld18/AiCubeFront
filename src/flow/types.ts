export type Ontology = 
  | 'TIMESTAMP' 
  | 'TIME' 
  | 'GEOMETRY' 
  | 'DOCUMENT' 
  | 'TEXT' 
  | 'FLOAT' 
  | 'INTEGER' 
  | 'TEXT';

export interface IField {
  Name: string;
  DisplayName: string;
  Type: 'string' | 'datetime' | 'boolean' | 'int' | 'double' | 'float' | 'geojson' | 'wkt' | 'Object';
  id?: string;
  guid?: string;
  Attributes?: any;
  OntologyType?: Ontology;
  GeoContent?: boolean;
  ShowOnGrid?: boolean;
  OriginalOntologyType?: Ontology;
  isDynamic?: boolean;
  OriginalDisplayName?: string;
}

export type NameValueObject = {
  Name: string | boolean;
  Value: string | boolean;
};

export type ParameterValue = NameValueObject | Array<NameValueObject> | string | boolean;

export interface IFlowParameter {
  Name: string;
  DisplayName: string;
  Type: 'Boolean' | 'Timestamp' | 'DateTime' | 'Haphoch' | 'Double' | 'Int' | 'String' | 'File';
  IsSingleValue: boolean;
  IsRequired: boolean;
  Description: string | null;
  HideFromList: string | null;
  AutoCompleteProvider: string;
  OptionsProvider: string;
  Options: Array<NameValueObject>;
  Category: string;
  ParameterSubtitle: null;
  Value: ParameterValue;
  visible: boolean;
  Role: '' | 'dynamic';
  OntologyType: any;
  IsServerFilterAutoComplete: boolean;
  NegativeOf?: any;
  ShowAsPassword?: boolean;
  ResetWhenCubeCopied?: boolean;
  InjectValueFromClient?: any;
  Attributes?: any;
  id?: string;
  isDynamic?: boolean;
  OriginalDisplayName?: string;
  OriginalOntologyType?: null;
  DefaultValue?: ParameterValue;
  Error?: any;
  isRequireDisplay?: boolean;
  isRequireAnyDisplay?: boolean;
}

export type UserDescriptions = {
  [queryDisplayName: string]: {
    queryDescription: string;
    parameters: {
      [parameterDisplayName: string]: string;
    };
  };
};

export type ToolDescriptions = UserDescriptions; // Same structure as UserDescriptions

export type FlowResponse = {
  Parameters: Partial<IFlowParameter>[];
  Fields: IField[];
  DisplayName: string;
  iframeFieldsToFilter: { [key: string]: string };
  userDescriptions?: UserDescriptions;
  toolDescriptions?: ToolDescriptions;
};

export type FlowCube = {
  id: string;
  UniqueName: string;
  Name: string;
  Description?: string;
  Type: 'query'; // add other types if needed
  Parameters: Partial<IFlowParameter>[];
  Fields: IField[];
  Metadata: {
    Owner: string;
    IgnoreBanana?: boolean;
    Tags?: string;
    Version?: string;
    DataStore?: string;
    CategoriesOrder?: string;
    OwnerEmail?: string;
  };
  Processes: Array<any>;
  ViewConfig: any;
  SavedProperties: any;
};

