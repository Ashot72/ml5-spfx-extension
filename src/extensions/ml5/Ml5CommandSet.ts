import { override } from '@microsoft/decorators'
import { sp } from '@pnp/sp'
import {
  BaseListViewCommandSet,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility'
import Container from './components/container'

export interface IMl5CommandSetProperties {}

export default class Ml5CommandSet extends BaseListViewCommandSet<
  IMl5CommandSetProperties
> {
  @override
  public onInit (): Promise<void> {
    return super.onInit().then(_ => sp.setup({ spfxContext: this.context }))
  }

  @override
  public onExecute (event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'ml5':
        const modal = new Container()
        modal.listId = this.context.pageContext.list.id.toString()
        modal.show()
        break
      default:
        throw new Error('Unknown command')
    }
  }
}
