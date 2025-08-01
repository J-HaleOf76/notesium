var t = `
<Pane v-if="$notesiumState.showLabelsPanel" name="labelsPanel" :defaultWidth="195" :minWidth="100">
  <div class="h-full overflow-y-auto bg-gray-700 text-gray-400 text-sm font-medium dark-scroll border-r border-gray-600">
    <ul class="space-y-1 cursor-pointer px-2">
      <li v-for="label in sortedLabelNotes" :key="label.Filename"
        @click="$notesiumState.showNotesPanel ? query='label:'+label.Title+' ' : $emit('finder-open', '/api/raw/links?color=true&filename=' + label.Filename)"
        class="group flex justify-between p-2 rounded-md hover:text-gray-100 hover:bg-gray-600">
        <span class="overflow-hidden truncate pr-2" v-text="label.Title" />
        <span class="group-hover:hidden text-gray-500" v-text="label.LinkedNotesCount" />
        <span class="hidden group-hover:block text-gray-500 hover:text-gray-100" @click.stop="$emit('note-open', label.Filename)">↗</span>
      </li>

      <li title="notes with 1-word titles are considered labels"
        class="flex items-center justify-items-center h-9 pl-2 pr-1 rounded-md hover:text-gray-100 hover:bg-gray-600">
        <input class="h-full w-full text-white hover:placeholder:text-gray-300 placeholder:text-gray-500 bg-transparent focus:outline-none text-sm"
          @keydown.space.prevent
          @keyup.esc="newLabel=''; $refs.newLabelInput.blur()"
          @keyup.enter="createNewLabelNote()"
          v-model="newLabel" ref="newLabelInput" placeholder="new label..." type="text" autocomplete="off" spellcheck="false" />
        <div class="flex items-center text-gray-500">
          <Icon v-if="!newLabel" name="outline-plus" size="h-4 w-4" @click="$refs.newLabelInput.focus()" class="cursor-pointer hover:text-gray-200" />
          <Icon v-if="newLabelStatus.isValid" name="mini-check" size="h-4 w-4"  @click="createNewLabelNote()" class="text-green-400" />
          <span v-if="newLabelStatus.error" v-text="newLabelStatus.error" class="text-red-400 text-xs whitespace-nowrap mt-1"></span>
        </div>
      </li>
    </ul>
  </div>
</Pane>

<Pane v-if="$notesiumState.showNotesPanel" name="notesPanel" :defaultWidth="380" :minWidth="100"
  :class="{'dark border-none': $notesiumState.notesPanelDarkMode}" class="border-r border-gray-200">

  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition duration-300 delay-200"
    leave-active-class="transition duration-200">
    <div v-if="previewFilename" class="absolute right-0 top-0 z-50">
      <div class="relative">
        <div class="absolute origin-top-right top-14 left-6 w-[40rem] h-[40rem] pl-4 py-4 rounded-lg shadow-2xl bg-white border border-gray-300
                    before:absolute before:bottom-0 before:top-0 before:-left-2 before:bg-white before:border-l before:border-b before:border-gray-300
                    before:w-4 before:h-4 before:rotate-45 before:-z-1 before:my-auto">
          <Preview :filename="previewFilename" appendIncomingLinks=true />
        </div>
      </div>
    </div>
  </Transition>

  <div class="flex items-center justify-items-center h-9 border-b border-gray-200 bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
    <input ref="queryInput" v-model="query" placeholder="filter..." autocomplete="off" spellcheck="false"
      @keyup.esc="query = ''; $refs.queryInput.blur();"
      class="h-full w-full px-4 ring-0 border-none focus:outline-none text-sm placeholder:text-gray-400
             text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-700" />

    <div class="inline-flex items-center justify-items-center mt-3 m-2 h-full space-x-4">
      <div v-show="query" @click="query = ''" title="clear"
        class="-mt-1 pr-2 cursor-pointer border-r border-gray-300 text-gray-400 hover:text-gray-700 dark:border-gray-500 dark:hover:text-gray-300">
        <Icon name="mini-x-mark" size="h-5 w-5" />
      </div>

      <div class="relative group inline-block text-left">
        <span title="labels" class="cursor-pointer text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">
          <Icon name="outline-tag" size="h-5 w-5" class="pb-1" />
        </span>
        <div class="hidden group-hover:block absolute right-0 z-50 w-64 pt-3 -mt-1 origin-top-right">
          <div class="rounded-md bg-white shadow-md border border-gray-200">
            <ul class="text-sm divide-y divide-gray-100">
              <template v-if="$notesiumState.showLabelsPanel || ($notesiumState.notesPanelCompact && $notesiumState.notesPanelCompactLabels)">
                <li class="flex items-center justify-between p-2 cursor-pointer" @click="$notesiumState.sidePanelSortLabels='title'">
                  <span class="text-gray-600">Title</span>
                  <span v-show="$notesiumState.sidePanelSortLabels == 'title'" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
                </li>
                <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50" @click="$notesiumState.sidePanelSortLabels='links'">
                  <span class="text-gray-600">Linked notes count</span>
                  <span v-show="$notesiumState.sidePanelSortLabels == 'links'" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
                </li>
              </template>
              <template v-else>
                <li class="flex items-center justify-between p-2 text-gray-300">
                  <span>Title</span>
                  <span v-show="$notesiumState.sidePanelSortLabels == 'title'"><Icon name="mini-check" size="h-5 w-5" /></span>
                </li>
                <li class="flex items-center justify-between p-2 text-gray-300">
                  <span>Link count</span>
                  <span v-show="$notesiumState.sidePanelSortLabels == 'links'"><Icon name="mini-check" size="h-5 w-5" /></span>
                </li>
              </template>
              <li class="pt-px bg-gray-200"></li>
              <li v-if="$notesiumState.notesPanelCompact" class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                @click="$notesiumState.notesPanelCompactLabels=!$notesiumState.notesPanelCompactLabels">
                <span class="text-gray-600">Labels tree</span>
                <span v-show="$notesiumState.notesPanelCompactLabels" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <li v-else class="flex items-center justify-between p-2 text-gray-300">
                <span>Labels tree</span>
                <span v-show="$notesiumState.notesPanelCompactLabels"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                @click="$notesiumState.showLabelsPanel=!$notesiumState.showLabelsPanel">
                <span class="text-gray-600">Labels panel</span>
                <span v-show="$notesiumState.showLabelsPanel" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <template v-if="!$notesiumState.showLabelsPanel">
                <li class="pt-px bg-gray-200"></li>
                <li class="flex items-center justify-items-center p-2" title="notes with 1-word titles are considered labels">
                  <input class="h-full w-full bg-transparent focus:outline-none text-sm placeholder:text-gray-400 text-gray-800"
                    @keydown.space.prevent
                    @keyup.esc="newLabel=''; $refs.newLabelInput.blur()"
                    @keyup.enter="createNewLabelNote()"
                    v-model="newLabel" ref="newLabelInput" placeholder="New label..." type="text" autocomplete="off" spellcheck="false" />
                  <div class="flex items-center cursor-pointer">
                    <Icon v-if="!newLabel" name="outline-plus" size="h-5 w-5" @click="$refs.newLabelInput.focus()" class="text-gray-400 hover:text-gray-600" />
                    <Icon v-if="newLabelStatus.isValid" name="mini-check" size="h-5 w-5" @click="createNewLabelNote()" class="text-green-500" />
                    <span v-if="newLabelStatus.error" v-text="newLabelStatus.error" class="cursor-default text-red-700 text-xs whitespace-nowrap mt-1"></span>
                  </div>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>

      <div class="relative group inline-block text-left">
        <span title="sort &amp; density" class="cursor-pointer text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">
          <Icon name="outline-bars-arrow-down" size="h-5 w-5" />
        </span>
        <div class="hidden group-hover:block absolute right-0 z-50 w-64 pt-3 -mt-1 origin-top-right">
          <div class="rounded-md bg-white shadow-md border border-gray-200">
            <ul class="divide-y divide-gray-100 text-sm">
              <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50" @click="$notesiumState.sidePanelSortNotes='title'">
                <span class="text-gray-600">Title</span>
                <span v-show="$notesiumState.sidePanelSortNotes == 'title'" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50" @click="$notesiumState.sidePanelSortNotes='mtime'">
                <span class="text-gray-600">Modified</span>
                <span v-show="$notesiumState.sidePanelSortNotes == 'mtime'" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50" @click="$notesiumState.sidePanelSortNotes='ctime'">
                <span class="text-gray-600">Created</span>
                <span v-show="$notesiumState.sidePanelSortNotes == 'ctime'" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50" @click="$notesiumState.sidePanelSortNotes='links'">
                <span class="text-gray-600">Linked notes count</span>
                <span v-show="$notesiumState.sidePanelSortNotes == 'links'" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <li class="bg-gray-200 pt-px"></li>
              <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50" @click="$notesiumState.notesPanelCompact=true">
                <span class="text-gray-600">Compact view</span>
                <span v-show="$notesiumState.notesPanelCompact" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50" @click="$notesiumState.notesPanelCompact=false">
                <span class="text-gray-600">Detailed view</span>
                <span v-show="!$notesiumState.notesPanelCompact" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
              <li class="bg-gray-200 pt-px"></li>
              <li class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                @click="$notesiumState.notesPanelDarkMode=!$notesiumState.notesPanelDarkMode">
                <span class="text-gray-600">Dark mode</span>
                <span v-show="$notesiumState.notesPanelDarkMode" class="text-indigo-500"><Icon name="mini-check" size="h-5 w-5" /></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="h-full flex flex-col justify-between overflow-y-scroll dark:bg-gray-700" :class="{'dark-scroll': $notesiumState.notesPanelDarkMode}">

    <ul v-if="$notesiumState.notesPanelCompact" class="mt-2 text-sm">
      <li v-if="$notesiumState.notesPanelCompactLabels" v-for="note in filteredLabelNotes" :key="'label-' + note.Filename">
        <details class="cursor-pointer [&_.rotate-on-open]:open:rotate-90">
          <summary class="group flex items-center justify-between justify-items-center list-none py-1.5 pl-2
                          rounded-r-2xl focus:outline-none text-gray-900 hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-gray-600">
            <div class="flex items-center justify-center gap-x-2 truncate">
              <div class="text-gray-400 dark:text-gray-500 rotate-on-open">
                <Icon name="chevron-right" size="h-5 w-5" />
              </div>
              <span class="flex space-x-2 overflow-hidden truncate pr-2">
                <span v-text="note.Title" />
                <span class="hidden group-hover:block text-gray-400 dark:text-gray-500" v-text="'('+note.LinkedNotesCount+')'" />
              <span>
            </div>
            <span class="hidden group-hover:flex space-x-2 pr-2 whitespace-nowrap">
              <span title="list links" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1"
                @click.stop="$emit('finder-open', '/api/raw/links?color=true&filename=' + note.Filename)">
                <Icon name="mini-arrows-right-left" size="h-3 w-3" />
              </span>
              <span class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                @mouseenter="previewFilename=note.Filename" @mouseleave="previewFilename=''"
                @click.stop="$emit('note-open', note.Filename, 1)">↗</span>
            </span>
          </summary>
          <div v-if="note.LinkedNotesCount > 0" class="ml-[18px] border-dotted border-l border-gray-300 dark:border-gray-500">
            <div v-for="link in note.LinkedNotes" :key="'link-' + link.Filename" @click="$emit('note-open', link.Filename, 1)"
              class="group flex items-center justify-items-center justify-between pl-[18px] py-1 pr-2 truncate rounded-r-2xl
                     text-gray-900 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-600">
              <div class="leading-6 overflow-hidden truncate" v-text="link.Title" :title="link.Title"></div>
              <div class="hidden group-hover:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 -mr-1 pr-1"
                @mouseenter="previewFilename=link.Filename" @mouseleave="previewFilename=''" v-text="'↗'">
              </div>
            </div>
          </div>
        </details>
      </li>
      <li v-for="note in filteredNotes" :key="note.Filename"
        @click="$emit('note-open', note.Filename)"
        class="group flex justify-between items-center py-1 pl-4 pr-2 cursor-pointer rounded-r-2xl text-gray-900 hover:bg-indigo-50
               dark:text-gray-400 dark:hover:bg-gray-600">
        <div class="text-sm leading-6 overflow-hidden truncate" v-text="note.Title" :title="note.Title"></div>
        <div class="hidden group-hover:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 -mr-1 pr-1"
          @mouseenter="previewFilename=note.Filename" @mouseleave="previewFilename=''" v-text="'↗'">
        </div>
      </li>
    </ul>

    <ul v-else class="divide-y divide-gray-100 dark:divide-gray-600">
      <li v-for="note in filteredNotes" :key="note.Filename"
        @click="$emit('note-open', note.Filename)"
        class="group flex justify-between py-3 pl-4 pr-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
        <div class="truncate">
          <div class="text-sm leading-6 overflow-hidden truncate text-gray-900 dark:text-gray-300" v-text="note.Title" :title="note.Title"></div>
          <div class="flex space-x-1 overflow-hidden truncate text-xs text-gray-400 leading-6">
            <span v-if="$notesiumState.sidePanelSortNotes == 'ctime'" v-text="note.CtimeRelative" title="created" />
            <span v-else v-text="note.MtimeRelative" title="modified" />
            <div class="space-x-1 overflow-hidden truncate">
              <template v-for="label in note.LinkedLabels">
                <span>·</span>
                <span class="hover:text-gray-600 dark:hover:text-gray-200" v-text="label" @click.stop="query='label:'+label+' '"></span>
              </template>
            </div>
          </div>
        </div>
        <div class="hidden group-hover:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 -my-3 py-3 -mr-2 pr-2"
          @mouseenter="previewFilename=note.Filename" @mouseleave="previewFilename=''" v-text="'↗'">
        </div>
      </li>
    </ul>

    <div v-if="query" class="group m-4 cursor-pointer text-xs text-gray-500 dark:text-gray-400"
      @click="$emit('finder-open', '/api/raw/lines', query.replace(/label:/g, ''))">
      <div class="truncate">
        {{ filteredNotes.length }}/{{ notesLength }} matches for "<span class="italic text-gray-600 dark:text-gray-300" v-text="query"></span>"
      </div>
      <div class="group-hover:underline mt-1" >Full text search &rarr;</div>
    </div>

  </div>
</Pane>
`

import Icon from './icon.js'
import Pane from './pane.js'
import Preview from './preview.js'
import { formatDate } from './dateutils.js';
export default {
  props: ['lastSave'],
  emits: ['note-open', 'note-new', 'finder-open'],
  components: { Pane, Icon, Preview },
  data() {
    return {
      query: '',
      notes: [],
      notesLength: 0,
      newLabel: '',
      previewFilename: '',
    }
  },
  methods: {
    fetchNotes() {
      fetch("/api/notes")
        .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
        .then(response => {
          const notes = Object.values(response);
          this.notesLength = notes.length;
          this.notes = notes.map(note => {
            const linkedNotes = [...new Map(
              [...(note.IncomingLinks || []), ...(note.OutgoingLinks || [])].map(link => [link.Filename, { Filename: link.Filename, Title: link.Title }])
            ).values()].sort((a, b) => a.Title.localeCompare(b.Title));
            const linkedLabels = linkedNotes.filter(link => link.Title && !link.Title.includes(' ')).map(link => link.Title);
            const mtime = new Date(note.Mtime);
            const ctime = new Date(note.Ctime);
            return {
              Filename: note.Filename,
              Title: note.Title,
              Mtime: mtime,
              Ctime: ctime,
              MtimeRelative: this.formatRelativeDate(mtime),
              CtimeRelative: this.formatRelativeDate(ctime),
              IsLabel: note.IsLabel,
              LinkedLabels: linkedLabels,
              LinkedNotes: linkedNotes,
              LinkedNotesCount: linkedNotes.length,
              SearchStr: (note.Title + ' ' + linkedLabels.join(' ')).toLowerCase(),
            };
          })
        })
        .catch(e => {
          console.error(e);
        });
    },
    formatRelativeDate(date) {
      const now = new Date();
      const nowTime = now.getTime();
      const dateTime = date.getTime();
      const diff = nowTime - dateTime;

      const minutes = Math.floor(diff / 60000); // 60 * 1000
      const hours = Math.floor(diff / 3600000); // 60 * 60 * 1000

      if (minutes < 0) {
        // future date
      } else if (minutes < 1) {
        return 'Just now';
      } else if (minutes < 60) {
        return `${minutes}m ago`;
      } else if (hours < 24) {
        return `${hours}h ago`;
      } else if (hours < 48) {
        return `Yesterday`;
      }

      const format = now.getFullYear() === date.getFullYear() ? '%b %d' : '%b %d, %Y';
      return formatDate(date, format);
    },
    createNewLabelNote() {
      if (this.newLabelStatus.isValid) {
        const content = `# ${this.newLabel}\n`;
        this.$emit('note-new', null, content);
        this.$refs.newLabelInput.blur();
        this.newLabel='';
      }
    },
  },
  computed: {
    newLabelStatus() {
      if (!this.newLabel) return { isValid: false, error: '' };
      if (this.newLabel.includes(' ')) return { isValid: false, error: 'not 1-word' };
      if (this.sortedLabelNotes.some(label => label.Title.toLowerCase() === this.newLabel.toLowerCase())) return { isValid: false, error: 'exists' };
      return { isValid: true, error: '' };
    },
    sortedNotes() {
      switch(this.$notesiumState.sidePanelSortNotes) {
        case 'title': return this.notes.sort((a, b) => a.Title.localeCompare(b.Title));
        case 'links': return this.notes.sort((a, b) => b.LinkedNotesCount - a.LinkedNotesCount);
        case 'mtime': return this.notes.sort((a, b) => b.Mtime - a.Mtime);
        case 'ctime': return this.notes.sort((a, b) => b.Ctime - a.Ctime);
      }
    },
    sortedLabelNotes() {
      switch(this.$notesiumState.sidePanelSortLabels) {
        case 'title': return this.notes.filter(note => note.IsLabel).sort((a, b) => a.Title.localeCompare(b.Title));
        case 'links': return this.notes.filter(note => note.IsLabel).sort((a, b) => b.LinkedNotesCount - a.LinkedNotesCount);
      }
    },
    filteredNotes() {
      const maxNotes = 300;
      const { query, sortedNotes } = this;
      if (!query) return sortedNotes.slice(0, maxNotes);
      const queryWords = query.toLowerCase().split(' ');
      const labelQuery = queryWords.find(word => word.startsWith('label:'));
      if (labelQuery) {
        const label = labelQuery.slice(6);
        if (!label) return sortedNotes.filter(note => note.IsLabel).slice(0, maxNotes);
        const notesSubset = sortedNotes.filter(note => note.LinkedLabels.some(l => l.toLowerCase() === label) || note.Title.toLowerCase() === label);
        const remainingQueryWords = queryWords.filter(word => word !== labelQuery);
        return notesSubset.filter(note => remainingQueryWords.every(queryWord => note.SearchStr.includes(queryWord))).slice(0, maxNotes);
      }
      return sortedNotes.filter(note => queryWords.every(queryWord => note.SearchStr.includes(queryWord))).slice(0, maxNotes);
    },
    filteredLabelNotes() {
      const { query, sortedLabelNotes } = this;
      if (!query) return sortedLabelNotes;
      const queryWords = query.toLowerCase().split(' ');
      return sortedLabelNotes.filter(note => queryWords.every(queryWord => note.SearchStr.includes(queryWord)));
    },
  },
  created() {
    this.fetchNotes();
  },
  watch: {
    'lastSave': function() { this.fetchNotes(); },
  },
  template: t
}

