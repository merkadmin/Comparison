export class NavigationBarItem{
    routerLink: string | undefined;
    title: string = '';
    menuIcon: string | undefined;
    isForAdminUser?: boolean;
    ChildrenList?: NavigationBarItem[];
}