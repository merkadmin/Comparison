export class NavigationBarItem{
    routerLink: string | undefined;
    title: string = '';
    menuIcon: string | undefined;
    orderIndex: number | undefined;
    isForAdminUser?: boolean;
    ChildrenList?: NavigationBarItem[];
}