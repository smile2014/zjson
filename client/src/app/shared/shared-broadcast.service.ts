import { Injectable, EventEmitter } from '@angular/core';
import { HintInfo, QuoteInfo, EditorOptions } from './shared-interface';

@Injectable()
export class SharedBroadcastService {
  private loadingEmiter: EventEmitter<boolean> = new EventEmitter;
  private hintEmiter: EventEmitter<any> = new EventEmitter;
  private editorEmiter: EventEmitter<any> = new EventEmitter;
  private quoteEmiter: EventEmitter<QuoteInfo | boolean> = new EventEmitter;
  private editorOptEmiter: EventEmitter<EditorOptions> = new EventEmitter;
  private compareHistEmiter: EventEmitter<any> = new EventEmitter;

  loadingStream: any = this.loadingEmiter.asObservable();
  hintStream: any = this.hintEmiter.asObservable();
  editorStream: any = this.editorEmiter.asObservable();
  quoteStream: any = this.quoteEmiter.asObservable();
  editorOptStream: any = this.editorOptEmiter.asObservable();
  compareHistStream: any = this.compareHistEmiter.asObservable();

  isEditorLoaded: boolean = false;
  tabsize: number = 2;

  constructor() { }

  showLoading = (time?: number) => {
    this.loadingEmiter.emit(true);
    if (fn.typeVal(time, 'num') >= 0) {
      fn.timeout('zjs-loading-timer', time, () => this.hideLoading());
    }
  }
  hideLoading = () => this.loadingEmiter.emit(false);
  showHint = (hintInfo: HintInfo) => this.hintEmiter.emit(hintInfo);
  editorReadyUp = () => this.editorEmiter.emit();
  changeQuote = (quoteInfo: QuoteInfo) => this.quoteEmiter.emit(quoteInfo);
  changeEditorOpts = (editorOpt: EditorOptions) => this.editorOptEmiter.emit(editorOpt);
  changeCompareHist = () => this.compareHistEmiter.emit();
}
