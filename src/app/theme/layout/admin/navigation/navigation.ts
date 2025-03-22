import { Injectable } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  icon?: string;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}
const NavigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'default',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/default',
        icon: 'ti ti-dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'elements',
    title: 'Boards',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'lakeviewboard',
        title: 'LakeView Board',
        type: 'item',
        classes: 'nav-item',
        url: '/lakeviewboard',
        icon: 'ti ti-sailboat'
      },
      {
        id: 'aucklandboard',
        title: 'Auckland Board',
        type: 'item',
        classes: 'nav-item',
        url: '/aucklandboard',
        icon: 'ti ti-box'
      },
      {
        id: 'tabler',
        title: 'Tabler',
        type: 'item',
        classes: 'nav-item',
        url: 'https://tabler-icons.io/',
        icon: 'ti ti-plant-2',
        target: true,
        external: true
      }
    ]
  }
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
