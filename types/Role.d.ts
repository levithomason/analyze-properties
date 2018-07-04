declare interface IRole {
  [key: string]: boolean
}

declare interface IRoles {
  approved: IRole
  superAdmin: IRole
}

declare type RolesType = keyof IRoles
