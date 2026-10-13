<template>
  <section class="space-y-4">
    <nav class="flex flex-wrap items-center gap-1.5 text-sm text-base-content/50" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-base-content">Home</NuxtLink><Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
      <NuxtLink to="/companies" class="hover:text-base-content">Customers</NuxtLink><Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
      <span class="max-w-64 truncate font-medium text-base-content/75">{{ company?.name || 'Customer detail' }}</span>
    </nav>

    <div v-if="loading && !company" class="space-y-4"><div class="skeleton h-48 rounded-xl" /><div class="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]"><div class="skeleton h-80 rounded-xl" /><div class="skeleton h-96 rounded-xl" /></div></div>

    <template v-else-if="company">
      <header class="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <div class="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex min-w-0 items-start gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">{{ customerInitials }}</div>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/40">Customer record</p>
              <h1 class="mt-1 truncate text-2xl font-bold">{{ company.name }}</h1>
              <p class="mt-1 font-mono text-xs text-base-content/50">{{ company.regnumber || 'No registration number' }}</p>
              <div class="mt-3 flex flex-wrap gap-1.5"><span v-for="type in company.accounttypes || []" :key="type.id" class="badge badge-ghost badge-sm">{{ type.name }}</span><span v-if="!company.accounttypes?.length" class="badge badge-ghost badge-sm">Unclassified customer</span></div>
            </div>
          </div>
          <div class="grid grid-cols-2 overflow-hidden rounded-lg border border-base-200 sm:grid-cols-4 lg:min-w-[30rem]">
            <div v-for="metric in customerMetrics" :key="metric.label" class="border-r border-base-200 p-3 last:border-r-0"><p class="text-[0.65rem] font-semibold uppercase tracking-wide text-base-content/40">{{ metric.label }}</p><p class="mt-1 text-xl font-semibold">{{ metric.value }}</p></div>
          </div>
        </div>
        <div class="grid border-t border-base-200 md:grid-cols-3">
          <div class="border-b border-base-200 p-4 md:border-b-0 md:border-r"><p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Business classification</p><p class="mt-1 text-sm font-medium">{{ customerClassification }}</p><p class="mt-0.5 text-xs text-base-content/45">{{ company.companyindustry?.name || 'Industry not specified' }}</p></div>
          <div class="border-b border-base-200 p-4 md:border-b-0 md:border-r"><p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Location</p><p class="mt-1 text-sm font-medium">{{ customerLocation }}</p><p class="mt-0.5 text-xs text-base-content/45">{{ company.address || 'Address not specified' }}</p></div>
          <div class="p-4"><p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Contact</p><p class="mt-1 truncate text-sm font-medium">{{ company.email || 'Email not specified' }}</p><p class="mt-0.5 text-xs text-base-content/45">{{ company.phone || 'Phone not specified' }}<span v-if="company.website"> · {{ company.website }}</span></p></div>
        </div>
      </header>

      <div class="overflow-x-auto rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-sm">
        <div class="flex min-w-max gap-1" role="tablist" aria-label="Customer types">
          <button
            v-for="type in customerTypeTabs"
            :key="type.id"
            type="button"
            role="tab"
            :aria-selected="activeCustomerTypeId === type.id"
            :class="[
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition',
              activeCustomerTypeId === type.id
                ? 'bg-slate-900 font-semibold text-white shadow-sm'
                : 'text-base-content/60 hover:bg-base-200/70 hover:text-base-content',
            ]"
            @click="activeCustomerTypeId = type.id"
          >
            <Icon :name="type.icon" class="h-4 w-4" />
            {{ type.name }}
          </button>
        </div>
      </div>

      <CompaniesUsers :company="company" @refreshcompany="fetchCompany()" />

    <div v-if="isSupplierTypeActive" class="grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside class="rounded-xl border border-base-300 bg-base-100 lg:sticky lg:top-4">
        <header class="border-b border-base-200 px-4 py-3"><p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Supplier profile</p><p class="mt-0.5 text-sm font-semibold">Customer records</p></header>
        <nav role="tablist" class="space-y-0.5 p-2">
          <button
            v-for="tab in bidderTabs"
            :key="tab.key"
            role="tab"
            :aria-selected="activeTab === tab.key"
            :class="['flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition', activeTab === tab.key ? 'bg-slate-900 font-semibold text-white' : 'text-base-content/65 hover:bg-base-200/60 hover:text-base-content']"
            @click="activeTab = tab.key"
          >
            <Icon :name="tab.icon" :class="['h-4 w-4 shrink-0', activeTab === tab.key ? 'text-white/75' : 'text-base-content/40']" />
            <span class="min-w-0 flex-1 truncate">{{ tab.label }}</span>
            <span v-if="tab.count !== undefined" :class="['rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold', activeTab === tab.key ? 'bg-white/15 text-white' : 'bg-base-200 text-base-content/55']">{{ tab.count }}</span>
          </button>
        </nav>
      </aside>

      <main class="min-w-0 overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <header class="flex items-start gap-3 border-b border-base-200 px-5 py-4"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content/60"><Icon :name="activeTabDefinition.icon" class="h-4.5 w-4.5" /></span><div><h2 class="font-bold">{{ activeTabDefinition.label }}</h2><p class="text-xs text-base-content/45">{{ activeTabDefinition.description }}</p></div></header>

        <div v-if="bidderLoading" class="py-10 text-center text-sm text-base-content/40">
          <span class="loading loading-spinner loading-md" />
        </div>

        <div v-else class="p-4">

          <!-- Suspense statement -->
          <div v-if="activeTab === 'suspense'">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold">Wallet balances</p>
                <p class="text-xs text-base-content/45">Current balances held against this customer.</p>
              </div>
              <span v-if="profile?.financial_source === 'PRAZ_CRM'" class="badge badge-outline badge-sm gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-success" />
                PRAZ CRM
              </span>
            </div>

            <div v-if="profile?.wallet_balances?.length" class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="wallet in profile.wallet_balances"
                :key="wallet.id ?? `${wallet.account_type}-${wallet.currency}`"
                class="rounded-xl border border-base-200 bg-base-100 p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base-content/60">
                    <Icon name="lucide:wallet-cards" class="h-4.5 w-4.5" />
                  </span>
                  <span class="badge badge-ghost badge-sm">{{ wallet.refundable ? 'Refundable' : 'Non-refundable' }}</span>
                </div>
                <p class="mt-4 text-xs font-semibold uppercase tracking-wider text-base-content/45">{{ wallet.currency || 'Currency' }}</p>
                <p class="mt-1 text-2xl font-bold tabular-nums">{{ formatAmount(wallet.balance) }}</p>
                <p class="mt-1 truncate text-xs text-base-content/50">{{ wallet.account_type || 'Wallet' }}</p>
              </article>
            </div>
            <div v-else class="mb-5 rounded-xl border border-dashed border-base-300 px-4 py-5 text-center text-xs text-base-content/45">
              No wallet balances were returned for this customer.
            </div>

            <div class="mb-3">
              <p class="text-sm font-semibold">Suspense transactions</p>
              <p class="text-xs text-base-content/45">Funds received, utilized and remaining in the wallet.</p>
            </div>
            <div v-if="!profile?.suspense_statement?.length" class="py-10 text-center text-sm text-base-content/40">
              <Icon name="lucide:scroll-text" class="mx-auto mb-2 h-6 w-6" />
              No suspense entries.
            </div>
            <div v-else class="overflow-x-auto rounded-xl border border-base-200">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Currency</th>
                    <th class="text-right">Amount</th>
                    <th class="text-right">Utilized</th>
                    <th class="text-right">Available</th>
                    <th>Bank Account Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in profile.suspense_statement" :key="entry.id">
                    <td class="text-sm">{{ entry.created_at ?? '—' }}</td>
                    <td class="text-sm">{{ entry.sourcetype }} #{{ entry.source_id }}</td>
                    <td>{{ entry.currency ?? '—' }}</td>
                    <td class="text-right font-mono">{{ formatAmount(entry.amount) }}</td>
                    <td class="text-right font-mono">{{ formatAmount(entry.total_receipts) }}</td>
                    <td class="text-right font-mono font-semibold">{{ formatAmount(entry.remaining) }}</td>
                    <td class="text-sm">{{ entry.bank_account_type ?? '—' }}</td>
                    <td><span class="badge badge-sm" :class="suspenseBadge(entry.status)">{{ entry.status ?? '—' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Registration invoices -->
          <div v-if="activeTab === 'invoices'">
            <div v-if="!profile?.registration_invoices?.length" class="py-10 text-center text-sm text-base-content/40">
              <Icon name="lucide:receipt" class="mx-auto mb-2 h-6 w-6" />
              No registration invoices.
            </div>
            <div v-else class="overflow-x-auto rounded-xl border border-base-200">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Item</th>
                    <th>Currency</th>
                    <th class="text-right">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inv in profile.registration_invoices" :key="inv.id">
                    <td class="font-mono text-xs">{{ inv.invoice_number }}</td>
                    <td class="font-mono text-xs">{{ inv.payment_reference }}</td>
                    <td class="text-sm">{{ inv.invoice_date ?? '—' }}</td>
                    <td class="text-sm">{{ inv.type ?? '—' }}</td>
                    <td class="text-sm">{{ inv.inventory_item ?? '—' }}</td>
                    <td>{{ inv.currency ?? '—' }}</td>
                    <td class="text-right font-mono">{{ formatAmount(inv.total) }}</td>
                    <td><span class="badge badge-sm" :class="invoiceBadge(inv.status)">{{ inv.status ?? '—' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Registrations -->
          <div v-if="activeTab === 'registrations'">
            <div v-if="!profile?.registrations?.length" class="py-10 text-center text-sm text-base-content/40">
              <Icon name="lucide:clipboard-list" class="mx-auto mb-2 h-6 w-6" />
              No registrations.
            </div>
            <div v-else class="overflow-x-auto rounded-xl border border-base-200">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Category</th>
                    <th>Section</th>
                    <th>Payment</th>
                    <th>Approval</th>
                    <th>Doc Reviewed</th>
                    <th>Certificate #</th>
                    <th>Expiry</th>
                    <th>Assigned officer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="reg in profile.registrations" :key="reg.id">
                    <td class="text-sm">{{ reg.year }}</td>
                    <td class="text-sm">{{ reg.category ?? '—' }}</td>
                    <td class="text-sm">{{ reg.section ?? '—' }}</td>
                    <td><span class="badge badge-sm" :class="paymentBadge(reg.payment_status)">{{ reg.payment_status }}</span></td>
                    <td><span class="badge badge-sm" :class="approvalBadge(reg.approval_status)">{{ reg.approval_status }}</span></td>
                    <td><span class="badge badge-sm" :class="reg.document_reviewed === 'Y' ? 'badge-success' : 'badge-ghost'">{{ reg.document_reviewed ?? '—' }}</span></td>
                    <td class="font-mono text-xs">{{ reg.certificate_number ?? '—' }}</td>
                    <td class="text-sm">{{ reg.expiry_date ?? '—' }}</td>
                    <td>
                      <div v-if="assignmentForYear(reg.year)?.assigned_user" class="min-w-40">
                        <p class="text-sm font-semibold">{{ userFullName(assignmentForYear(reg.year).assigned_user) }}</p>
                        <p class="truncate text-xs text-base-content/45">{{ assignmentForYear(reg.year).assigned_user.email }}</p>
                      </div>
                      <span v-else class="badge badge-ghost badge-sm">Unassigned</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Registration case activity -->
          <div v-if="activeTab === 'case_activity'" class="space-y-5">
            <section>
              <div class="mb-3">
                <h3 class="text-sm font-semibold">Application assignment</h3>
                <p class="text-xs text-base-content/45">Accountable officers currently assigned to this customer’s registration applications.</p>
              </div>
              <div v-if="profile?.registration_assignments?.length" class="grid gap-3 xl:grid-cols-2">
                <article v-for="assignment in profile.registration_assignments" :key="assignment.id" class="rounded-xl border border-base-200 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{{ userInitials(assignment.assigned_user) }}</span>
                      <div class="min-w-0">
                        <p class="truncate font-semibold">{{ userFullName(assignment.assigned_user) }}</p>
                        <p class="truncate text-xs text-base-content/45">{{ assignment.assigned_user?.email || 'Email unavailable' }}</p>
                      </div>
                    </div>
                    <span class="badge badge-neutral badge-sm">{{ assignment.year }}</span>
                  </div>
                  <dl class="mt-4 grid gap-2 border-t border-base-200 pt-3 text-xs sm:grid-cols-2">
                    <div><dt class="text-base-content/40">Assigned by</dt><dd class="mt-0.5 font-medium">{{ userFullName(assignment.assigned_by) }}</dd></div>
                    <div><dt class="text-base-content/40">Assigned</dt><dd class="mt-0.5 font-medium">{{ formatDateTime(assignment.assigned_at) }}</dd></div>
                  </dl>
                  <p v-if="assignment.notes" class="mt-3 rounded-lg bg-base-200/50 px-3 py-2 text-xs text-base-content/65">{{ assignment.notes }}</p>
                </article>
              </div>
              <div v-else class="rounded-xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/45">
                <Icon name="lucide:user-round-minus" class="mx-auto mb-2 h-6 w-6" />No accountable officer is currently assigned.
              </div>
            </section>

            <div class="grid gap-4 xl:grid-cols-2">
              <section class="overflow-hidden rounded-xl border border-base-200">
                <header class="border-b border-base-200 px-4 py-3"><h3 class="text-sm font-semibold">Registration case comments</h3><p class="text-xs text-base-content/45">Notes added by officers working on this customer’s case.</p></header>
                <div v-if="profile?.registration_comments?.length" class="max-h-[32rem] divide-y divide-base-200 overflow-y-auto">
                  <article v-for="comment in profile.registration_comments" :key="comment.id" class="p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex min-w-0 items-center gap-2">
                        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-xs font-bold">{{ comment.is_ai ? 'AI' : userInitials(comment.author) }}</span>
                        <div class="min-w-0"><p class="truncate text-sm font-semibold">{{ comment.is_ai ? 'Registration AI' : userFullName(comment.author) }}</p><p class="text-xs text-base-content/40">{{ formatDateTime(comment.created_at) }}</p></div>
                      </div>
                      <span v-if="comment.area" class="badge badge-ghost badge-sm">{{ comment.area }}</span>
                    </div>
                    <p class="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-base-content/75">{{ comment.comment }}</p>
                  </article>
                </div>
                <p v-else class="p-8 text-center text-sm text-base-content/40">No registration case comments have been recorded.</p>
              </section>

              <section class="overflow-hidden rounded-xl border border-base-200">
                <header class="border-b border-base-200 px-4 py-3"><h3 class="text-sm font-semibold">Finance and POP verification comments</h3><p class="text-xs text-base-content/45">Finance decisions and automatic payment-verification findings.</p></header>
                <div v-if="profile?.payment_verification_comments?.length" class="max-h-[32rem] divide-y divide-base-200 overflow-y-auto">
                  <article v-for="comment in profile.payment_verification_comments" :key="comment.id" class="p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex min-w-0 items-center gap-2">
                        <span :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold', comment.source === 'AI' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700']">{{ comment.source === 'AI' ? 'AI' : userInitials(comment.author) }}</span>
                        <div class="min-w-0"><p class="truncate text-sm font-semibold">{{ comment.source === 'AI' ? 'POP verification AI' : userFullName(comment.author) }}</p><p class="text-xs text-base-content/40">{{ formatDateTime(comment.created_at) }}</p></div>
                      </div>
                      <span class="badge badge-ghost badge-sm">{{ formatStatus(comment.status) }}</span>
                    </div>
                    <p class="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-base-content/75">{{ comment.comment }}</p>
                    <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/45">
                      <span v-if="comment.invoice_number">Invoice {{ comment.invoice_number }}</span>
                      <span v-if="comment.payment_reference">Ref {{ comment.payment_reference }}</span>
                      <span v-if="comment.confidence !== null && comment.confidence !== undefined">Confidence {{ Number(comment.confidence).toFixed(0) }}%</span>
                    </div>
                  </article>
                </div>
                <p v-else class="p-8 text-center text-sm text-base-content/40">No finance or automatic POP verification comments have been recorded.</p>
              </section>
            </div>
          </div>

          <!-- Documents -->
          <div v-if="activeTab === 'documents'">
            <div v-if="!profile?.documents?.length" class="py-10 text-center text-sm text-base-content/40">
              <Icon name="lucide:file-x" class="mx-auto mb-2 h-6 w-6" />
              No documents uploaded.
            </div>
            <div v-else class="overflow-x-auto rounded-xl border border-base-200">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Rejection Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="doc in profile.documents" :key="doc.id">
                    <td class="font-medium">{{ doc.name }}</td>
                    <td class="text-xs text-base-content/50">{{ doc.file_name ?? '—' }}</td>
                    <td class="text-sm">{{ formatFileSize(doc.file_size) }}</td>
                    <td><span class="badge badge-sm" :class="docStatusClass(doc.status)">{{ doc.status ?? '—' }}</span></td>
                    <td class="max-w-md text-xs">
                      <span v-if="isRejected(doc.status) && doc.rejection_reason" class="text-error">{{ doc.rejection_reason }}</span>
                      <span v-else class="text-base-content/30">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Directors -->
          <div v-if="activeTab === 'directors'">
            <div v-if="!profile?.directors?.length" class="py-10 text-center text-sm text-base-content/40">
              <Icon name="lucide:users" class="mx-auto mb-2 h-6 w-6" />
              No directors on record.
            </div>
            <div v-else class="overflow-x-auto rounded-xl border border-base-200">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>National ID</th>
                    <th>Status</th>
                    <th>Rejection Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dir in profile.directors" :key="dir.id">
                    <td class="font-medium">{{ dir.name }}</td>
                    <td class="text-sm">{{ dir.gender ?? '—' }}</td>
                    <td class="text-sm font-mono">{{ dir.national_id ?? '—' }}</td>
                    <td><span class="badge badge-sm" :class="docStatusClass(dir.status)">{{ dir.status ?? '—' }}</span></td>
                    <td class="max-w-md text-xs">
                      <span v-if="isRejected(dir.status) && dir.reject_reason" class="text-error">{{ dir.reject_reason }}</span>
                      <span v-else class="text-base-content/30">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Shareholders -->
          <div v-if="activeTab === 'shareholders'">
            <div v-if="!profile?.shareholders?.length" class="py-10 text-center text-sm text-base-content/40">
              <Icon name="lucide:users-round" class="mx-auto mb-2 h-6 w-6" />
              No shareholders on record.
            </div>
            <div v-else class="overflow-x-auto rounded-xl border border-base-200">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Nationality</th>
                    <th>ID Type</th>
                    <th>ID Number</th>
                    <th class="text-right">Share %</th>
                    <th>Status</th>
                    <th>Rejection Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sh in profile.shareholders" :key="sh.id">
                    <td class="font-medium">{{ sh.name }}</td>
                    <td class="text-sm">{{ sh.nationality ?? '—' }}</td>
                    <td class="text-sm">{{ sh.identification_type ?? '—' }}</td>
                    <td class="text-sm font-mono">{{ sh.identification_number ?? '—' }}</td>
                    <td class="text-right font-mono">{{ sh.share_percentage }}%</td>
                    <td><span class="badge badge-sm" :class="docStatusClass(sh.status)">{{ sh.status ?? '—' }}</span></td>
                    <td class="max-w-md text-xs">
                      <span v-if="isRejected(sh.status) && sh.reject_reason" class="text-error">{{ sh.reject_reason }}</span>
                      <span v-else class="text-base-content/30">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Portfolio -->
          <div v-if="activeTab === 'portfolio'">
            <div v-if="!profile?.portfolio" class="py-10 text-sm text-base-content/40">
              <Icon name="lucide:briefcase" class="mb-2 h-6 w-6" />
              No portfolio information available.
            </div>
            <div v-else class="space-y-4">
              <div class="rounded-xl border border-base-200">
                <div class="border-b border-base-200 px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50">Business Information</p>
                </div>
                <table class="table table-sm w-full">
                  <tbody>
                    <tr>
                      <td class="w-48 text-sm text-base-content/50">Date Established</td>
                      <td class="text-sm">{{ profile.portfolio.date_established ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Branches</td>
                      <td class="text-sm">{{ profile.portfolio.branches ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Description</td>
                      <td class="text-sm leading-relaxed">{{ profile.portfolio.business_description ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="rounded-xl border border-base-200">
                <div class="border-b border-base-200 px-4 py-3 flex items-center justify-between">
                  <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50">Products / Services</p>
                  <span class="badge badge-sm">{{ profile.portfolio.products?.length ?? 0 }}</span>
                </div>
                <table v-if="profile.portfolio.products?.length" class="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, i) in profile.portfolio.products" :key="i">
                      <td class="font-medium">{{ p.name }}</td>
                      <td class="text-sm">{{ p.description ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="px-4 py-6 text-sm text-base-content/40">No products on record.</p>
              </div>

              <div class="rounded-xl border border-base-200">
                <div class="border-b border-base-200 px-4 py-3 flex items-center justify-between">
                  <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50">Past Orders</p>
                  <span class="badge badge-sm">{{ profile.portfolio.orders?.length ?? 0 }}</span>
                </div>
                <table v-if="profile.portfolio.orders?.length" class="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Year</th>
                      <th>Currency</th>
                      <th class="text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(o, i) in profile.portfolio.orders" :key="i">
                      <td class="text-sm">{{ o.description }}</td>
                      <td class="text-sm">{{ o.year }}</td>
                      <td class="text-sm">{{ o.currency ?? '—' }}</td>
                      <td class="text-right font-mono">{{ formatAmount(o.value) }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="px-4 py-6 text-sm text-base-content/40">No orders on record.</p>
              </div>
            </div>
          </div>

          <!-- Digital profile -->
          <div v-if="activeTab === 'digital_profile'">
            <div v-if="!profile?.digital_profile" class="py-10 text-center text-sm text-base-content/40">
              <Icon name="lucide:cpu" class="mx-auto mb-2 h-6 w-6" />
              No digital profile generated yet.
            </div>
            <div v-else class="space-y-3">
              <p class="text-xs text-base-content/50">Generated: {{ profile.digital_profile.generated_at ?? '—' }}</p>
              <pre class="rounded-xl border border-base-200 bg-base-50 p-4 text-xs leading-relaxed overflow-x-auto">{{ formatJson(profile.digital_profile.profile_data) }}</pre>
            </div>
          </div>

        </div>
      </main>
    </div>

    <section v-else-if="isEntityTypeActive" class="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <header class="flex flex-col gap-3 border-b border-base-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content/60"><Icon name="lucide:landmark" class="h-4.5 w-4.5" /></span>
          <div><h2 class="font-bold">Procurement entity activity</h2><p class="text-xs text-base-content/45">Annual plans, tenders and regulated procurement activity.</p></div>
        </div>
        <select v-model.number="entityYear" class="select select-bordered select-sm w-28" aria-label="Reporting year">
          <option v-for="year in entityYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </header>

      <div class="grid items-start lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside class="border-b border-base-200 p-2 lg:min-h-[34rem] lg:border-b-0 lg:border-r">
          <nav class="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1" aria-label="Procurement entity records">
            <button
              v-for="tab in entityTabs"
              :key="tab.key"
              type="button"
              :class="['flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition', activeEntityTab === tab.key ? 'bg-slate-900 font-semibold text-white' : 'text-base-content/60 hover:bg-base-200/70 hover:text-base-content']"
              @click="activeEntityTab = tab.key"
            >
              <Icon :name="tab.icon" class="h-4 w-4 shrink-0" />
              <span class="min-w-0 flex-1 truncate">{{ tab.label }}</span>
              <span :class="['rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold', activeEntityTab === tab.key ? 'bg-white/15 text-white' : 'bg-base-200 text-base-content/55']">{{ tab.count }}</span>
            </button>
          </nav>
        </aside>

        <main class="min-w-0">
      <div v-if="entityLoading" class="flex min-h-72 items-center justify-center"><span class="loading loading-spinner loading-md" /></div>
      <div v-else-if="entityProfile && activeEntityTab === 'tenders'" class="space-y-5 p-5">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article v-for="metric in entityMetrics" :key="metric.label" class="rounded-xl border border-base-200 p-4">
            <div class="flex items-center justify-between"><p class="text-xs font-semibold uppercase tracking-wide text-base-content/45">{{ metric.label }}</p><Icon :name="metric.icon" class="h-4 w-4 text-base-content/35" /></div>
            <p class="mt-2 text-2xl font-bold tabular-nums">{{ metric.value }}</p>
          </article>
        </div>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <article class="rounded-xl border border-base-200">
            <header class="flex items-center justify-between border-b border-base-200 px-4 py-3"><div><h3 class="text-sm font-semibold">Annual procurement plan</h3><p class="text-xs text-base-content/45">{{ entityYear }} planning and utilization</p></div><span v-if="entityProfile.plan" class="badge badge-sm" :class="statusBadge(entityProfile.plan.status)">{{ formatStatus(entityProfile.plan.status) }}</span></header>
            <div v-if="entityProfile.plan" class="space-y-4 p-4">
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div><p class="text-xs text-base-content/45">Plan items</p><p class="mt-1 font-semibold">{{ entityProfile.plan_summary?.items ?? 0 }}</p></div>
                <div><p class="text-xs text-base-content/45">Utilized</p><p class="mt-1 font-semibold">{{ entityProfile.plan_summary?.utilized_items ?? 0 }}</p></div>
                <div><p class="text-xs text-base-content/45">Plan value</p><p class="mt-1 font-semibold">{{ entityProfile.plan_summary?.currency || '' }} {{ formatAmount(entityProfile.plan_summary?.total_value) }}</p></div>
                <div><p class="text-xs text-base-content/45">Committed</p><p class="mt-1 font-semibold">{{ entityProfile.plan_summary?.currency || '' }} {{ formatAmount(entityProfile.plan_summary?.utilized_value) }}</p></div>
              </div>
              <div><div class="mb-1.5 flex justify-between text-xs"><span class="text-base-content/50">Plan utilization</span><span class="font-semibold">{{ entityProfile.plan_summary?.utilization_percent ?? 0 }}%</span></div><progress class="progress progress-neutral h-2 w-full" :value="entityProfile.plan_summary?.utilization_percent ?? 0" max="100" /></div>
              <NuxtLink v-if="can('can.access.annualprocurementplans')" :to="`/admin-plan-dashboard/plans/${entityProfile.plan.uuid}`" class="btn btn-outline btn-sm"><Icon name="lucide:external-link" /> Open plan</NuxtLink>
            </div>
            <div v-else class="p-8 text-center text-sm text-base-content/45"><Icon name="lucide:calendar-x" class="mx-auto mb-2 h-6 w-6" />No annual procurement plan was found for {{ entityYear }}.</div>
          </article>

          <article class="rounded-xl border border-base-200">
            <header class="border-b border-base-200 px-4 py-3"><h3 class="text-sm font-semibold">Tender methods</h3><p class="text-xs text-base-content/45">Tenders grouped by procurement method</p></header>
            <div v-if="entityProfile.method_breakdown?.length" class="divide-y divide-base-200 px-4">
              <div v-for="method in entityProfile.method_breakdown" :key="method.id" class="flex items-center justify-between gap-3 py-3"><div class="min-w-0"><p class="truncate text-sm font-medium">{{ method.name }}</p><p class="text-xs text-base-content/40">{{ method.code || 'No code' }}</p></div><span class="badge badge-ghost badge-sm">{{ method.count }}</span></div>
            </div>
            <p v-else class="p-8 text-center text-sm text-base-content/40">No tender methods recorded.</p>
          </article>
        </div>

        <article class="overflow-hidden rounded-xl border border-base-200">
          <header class="border-b border-base-200 px-4 py-3"><h3 class="text-sm font-semibold">Recent tenders</h3><p class="text-xs text-base-content/45">Latest procurement activity for {{ entityYear }}</p></header>
          <div v-if="entityProfile.tenders?.length" class="overflow-x-auto"><table class="table table-sm"><thead><tr><th>Tender</th><th>Title</th><th>Method</th><th>Closing date</th><th>Status</th></tr></thead><tbody><tr v-for="tender in entityProfile.tenders" :key="tender.uuid"><td class="font-mono text-xs">{{ tender.tendernumber || '—' }}</td><td class="max-w-md truncate font-medium">{{ tender.title }}</td><td>{{ tender.method || '—' }}</td><td>{{ tender.closing_at || '—' }}</td><td><span class="badge badge-sm" :class="statusBadge(tender.status)">{{ formatStatus(tender.status) }}</span></td></tr></tbody></table></div>
          <p v-else class="p-8 text-center text-sm text-base-content/40">No tenders recorded for this year.</p>
        </article>
      </div>

      <section v-else-if="entityProfile && activeEntityTab === 'app_invoices'" class="p-5">
        <header class="mb-4"><h3 class="font-bold">APP invoices</h3><p class="text-xs text-base-content/45">Annual procurement plan authorization invoices for {{ entityYear }}.</p></header>
        <div v-if="entityProfile.app_invoices?.length" class="overflow-x-auto rounded-xl border border-base-200"><table class="table table-sm"><thead><tr><th>Invoice</th><th>Plan</th><th>Date</th><th>Currency</th><th class="text-right">Amount</th><th>Payment</th><th>CRM status</th></tr></thead><tbody><tr v-for="invoice in entityProfile.app_invoices" :key="invoice.id"><td><p class="font-mono text-xs">{{ invoice.invoice_number }}</p><p class="text-xs text-base-content/40">{{ invoice.payment_reference }}</p></td><td><NuxtLink v-if="invoice.plan?.uuid && can('can.access.annualprocurementplans')" :to="`/admin-plan-dashboard/plans/${invoice.plan.uuid}`" class="link link-hover text-sm font-medium">{{ invoice.plan.year }}</NuxtLink><span v-else>{{ invoice.plan?.year || '—' }}</span></td><td>{{ invoice.invoice_date || '—' }}</td><td>{{ invoice.currency || '—' }}</td><td class="text-right font-mono">{{ formatAmount(invoice.total) }}</td><td><span class="badge badge-sm" :class="invoiceBadge(invoice.status)">{{ formatStatus(invoice.status) }}</span></td><td><span class="badge badge-ghost badge-sm">{{ formatStatus(invoice.crm_status) }}</span></td></tr></tbody></table></div>
        <div v-else class="rounded-xl border border-dashed border-base-300 p-10 text-center text-sm text-base-content/40"><Icon name="lucide:receipt-text" class="mx-auto mb-2 h-6 w-6" />No APP invoices recorded for {{ entityYear }}.</div>
      </section>

      <section v-else-if="entityProfile && activeEntityTab === 'awards'" class="p-5">
        <header class="mb-4"><h3 class="font-bold">Tender awards</h3><p class="text-xs text-base-content/45">Award decisions issued by this procurement entity.</p></header>
        <div v-if="entityProfile.awards?.length" class="overflow-x-auto rounded-xl border border-base-200"><table class="table table-sm"><thead><tr><th>Tender</th><th>Supplier</th><th class="text-right">Award amount</th><th>Published</th><th>Standstill ends</th><th>Status</th></tr></thead><tbody><tr v-for="award in entityProfile.awards" :key="award.id"><td><p class="font-mono text-xs">{{ award.tender?.tendernumber || '—' }}</p><p class="max-w-xs truncate text-xs text-base-content/45">{{ award.tender?.title }}</p></td><td class="font-medium">{{ award.supplier_name }}</td><td class="text-right font-mono">{{ award.currency }} {{ formatAmount(award.amount) }}</td><td>{{ award.published_at || '—' }}</td><td>{{ award.standstill_ends_at || '—' }}</td><td><span class="badge badge-sm" :class="statusBadge(award.status)">{{ formatStatus(award.status) }}</span></td></tr></tbody></table></div>
        <div v-else class="rounded-xl border border-dashed border-base-300 p-10 text-center text-sm text-base-content/40"><Icon name="lucide:badge-check" class="mx-auto mb-2 h-6 w-6" />No awards recorded for {{ entityYear }}.</div>
      </section>

      <section v-else-if="entityProfile && activeEntityTab === 'contracts'" class="p-5">
        <header class="mb-4"><h3 class="font-bold">Contracts</h3><p class="text-xs text-base-content/45">Awarded tenders that have reached contracted status.</p></header>
        <div v-if="entityProfile.contracts?.length" class="overflow-x-auto rounded-xl border border-base-200"><table class="table table-sm"><thead><tr><th>Contract</th><th>Title</th><th>Supplier</th><th>Type</th><th class="text-right">Value</th><th>Status</th></tr></thead><tbody><tr v-for="contract in entityProfile.contracts" :key="contract.id"><td class="font-mono text-xs">{{ contract.contract_number || '—' }}</td><td class="max-w-sm truncate font-medium">{{ contract.title }}</td><td>{{ contract.supplier_name || '—' }}</td><td>{{ formatStatus(contract.contract_type) }}</td><td class="text-right font-mono">{{ contract.currency || '' }} {{ formatAmount(contract.amount) }}</td><td><span class="badge badge-success badge-sm">{{ formatStatus(contract.status) }}</span></td></tr></tbody></table></div>
        <div v-else class="rounded-xl border border-dashed border-base-300 p-10 text-center text-sm text-base-content/40"><Icon name="lucide:file-signature" class="mx-auto mb-2 h-6 w-6" />No contracts recorded for {{ entityYear }}.</div>
      </section>
        </main>
      </div>
    </section>

    <section v-else class="rounded-xl border border-base-300 bg-base-100 p-8 text-center shadow-sm">
      <Icon :name="activeCustomerType?.icon || 'lucide:building-2'" class="mx-auto h-8 w-8 text-base-content/35" />
      <h2 class="mt-3 font-bold">{{ activeCustomerType?.name || 'Customer type' }}</h2>
      <p class="mx-auto mt-1 max-w-lg text-sm text-base-content/50">No specialized activity view is configured for this customer type. Customer identity and user information remain available above.</p>
    </section>

    </template>

    <div v-else-if="!loading" class="rounded-xl border border-warning/30 bg-warning/10 p-8 text-center"><Icon name="lucide:user-round-x" class="mx-auto h-9 w-9 text-warning" /><h2 class="mt-3 font-bold">Customer unavailable</h2><p class="mt-1 text-sm text-base-content/55">The requested customer could not be loaded.</p><NuxtLink to="/companies" class="btn btn-neutral btn-sm mt-4">Return to customers</NuxtLink></div>

    <Loader :loading="loading" />
  </section>
</template>

<script setup>
definePageMeta({ layout: 'default' });

const toast = useToast();
const route = useRoute();
const uuid = route.params.uuid;
const loading = ref(false);
const company = ref(null);
const { can } = useCheckPermission();

const profile = ref(null);
const bidderLoading = ref(false);
const activeTab = ref('suspense');
const activeCustomerTypeId = ref(null);
const entityProfile = ref(null);
const entityLoading = ref(false);
const entityYear = ref(new Date().getFullYear());
const activeEntityTab = ref('tenders');

const accountTypeKind = (name = '') => {
  const normalized = name.toLowerCase();
  if (normalized.includes('bidder') || normalized.includes('supplier')) return 'supplier';
  if ((normalized.includes('procurement') || normalized.includes('procuring')) && normalized.includes('entity')) return 'entity';
  if (normalized.includes('authority') || normalized.includes('regulator')) return 'regulator';
  return 'generic';
};

const accountTypeIcon = kind => ({
  supplier: 'lucide:truck',
  entity: 'lucide:landmark',
  regulator: 'lucide:shield-check',
  generic: 'lucide:building-2',
}[kind]);

const customerTypeTabs = computed(() => (company.value?.accounttypes ?? []).map(type => {
  const kind = accountTypeKind(type.name);
  return { ...type, kind, icon: accountTypeIcon(kind) };
}));

const activeCustomerType = computed(() => customerTypeTabs.value.find(type => type.id === activeCustomerTypeId.value) ?? customerTypeTabs.value[0] ?? null);
const isSupplierTypeActive = computed(() => activeCustomerType.value?.kind === 'supplier');
const isEntityTypeActive = computed(() => activeCustomerType.value?.kind === 'entity');
const entityYears = computed(() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, index) => current + 1 - index);
});

const bidderTabs = computed(() => [
  { key: 'suspense', label: 'Suspense statement', description: 'Unallocated and processed customer funds.', icon: 'lucide:scroll-text', count: profile.value?.suspense_statement?.length },
  { key: 'invoices', label: 'Registration invoices', description: 'Supplier registration billing and settlement.', icon: 'lucide:receipt', count: profile.value?.registration_invoices?.length },
  { key: 'registrations', label: 'Registrations', description: 'Category registrations and approval history.', icon: 'lucide:clipboard-list', count: profile.value?.registrations?.length },
  { key: 'case_activity', label: 'Case activity', description: 'Assignment, registration comments and POP verification findings.', icon: 'lucide:messages-square', count: (profile.value?.registration_comments?.length ?? 0) + (profile.value?.payment_verification_comments?.length ?? 0) },
  { key: 'documents', label: 'Customer documents', description: 'Uploaded registration and compliance records.', icon: 'lucide:file-text', count: profile.value?.documents?.length },
  { key: 'directors', label: 'Directors', description: 'Customer directors and verification results.', icon: 'lucide:user-check', count: profile.value?.directors?.length },
  { key: 'shareholders', label: 'Shareholders', description: 'Ownership structure and verification results.', icon: 'lucide:users-round', count: profile.value?.shareholders?.length },
  { key: 'portfolio', label: 'Portfolio', description: 'Business capability, products and previous orders.', icon: 'lucide:briefcase' },
  { key: 'digital_profile', label: 'Digital profile', description: 'Generated digital customer intelligence.', icon: 'lucide:cpu' },
]);

const activeTabDefinition = computed(() => bidderTabs.value.find(tab => tab.key === activeTab.value) ?? bidderTabs.value[0]);

const customerInitials = computed(() => (company.value?.name ?? 'Customer')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part.charAt(0).toUpperCase())
  .join(''));

const customerClassification = computed(() => {
  const category = company.value?.companysubcategory?.category?.name;
  const subcategory = company.value?.companysubcategory?.name;
  return [category, subcategory].filter(Boolean).join(' · ') || 'Not classified';
});

const customerLocation = computed(() => [
  company.value?.city,
  company.value?.district?.name,
  company.value?.province?.name,
  company.value?.country,
].filter(Boolean).join(', ') || 'Location not specified');

const customerMetrics = computed(() => {
  const common = [
    { label: 'Users', value: company.value?.users?.length ?? 0 },
    { label: 'Types', value: company.value?.accounttypes?.length ?? 0 },
  ];

  if (isSupplierTypeActive.value) {
    return [...common,
      { label: 'Registrations', value: bidderLoading.value ? '…' : profile.value?.registrations?.length ?? 0 },
      { label: 'Invoices', value: bidderLoading.value ? '…' : profile.value?.registration_invoices?.length ?? 0 },
    ];
  }

  if (isEntityTypeActive.value) {
    return [...common,
      { label: 'Annual plan', value: entityLoading.value ? '…' : entityProfile.value?.has_plan ? 'Yes' : 'No' },
      { label: 'Tenders', value: entityLoading.value ? '…' : entityProfile.value?.stats?.total_tenders ?? 0 },
    ];
  }

  return [...common,
    { label: 'Selected type', value: activeCustomerType.value?.name ?? '—' },
    { label: 'Country', value: company.value?.country ?? '—' },
  ];
});

const entityMetrics = computed(() => [
  { label: 'Total tenders', value: entityProfile.value?.stats?.total_tenders ?? 0, icon: 'lucide:file-stack' },
  { label: 'Live', value: entityProfile.value?.stats?.live_tenders ?? 0, icon: 'lucide:radio' },
  { label: 'In evaluation', value: entityProfile.value?.stats?.in_evaluation ?? 0, icon: 'lucide:scan-search' },
  { label: 'Awarded', value: entityProfile.value?.stats?.awarded ?? 0, icon: 'lucide:badge-check' },
  { label: 'Tender value', value: formatAmount(entityProfile.value?.stats?.tender_value ?? 0), icon: 'lucide:circle-dollar-sign' },
]);

const entityTabs = computed(() => [
  { key: 'tenders', label: 'Tenders', icon: 'lucide:file-stack', count: entityProfile.value?.tenders?.length ?? 0 },
  { key: 'app_invoices', label: 'APP invoices', icon: 'lucide:receipt-text', count: entityProfile.value?.app_invoices?.length ?? 0 },
  { key: 'awards', label: 'Awards', icon: 'lucide:badge-check', count: entityProfile.value?.awards?.length ?? 0 },
  { key: 'contracts', label: 'Contracts', icon: 'lucide:file-signature', count: entityProfile.value?.contracts?.length ?? 0 },
]);

useHead({ title: () => company.value?.name ? `${company.value.name} · Customer` : 'Customer' });

const fetchCompany = async () => {
  loading.value = true;
  try {
    const { ok, data } = await useCompanyHelper().getCompany(uuid);
    if (ok) {
      company.value = data;
      const types = data?.accounttypes ?? [];
      if (!types.some(type => type.id === activeCustomerTypeId.value)) {
        activeCustomerTypeId.value = types[0]?.id ?? null;
      }
    }
  } catch (err) {
    toast.error({ title: 'Error', message: err?.message ?? 'Error fetching customer', position: 'topRight', layout: 2 });
  } finally {
    loading.value = false;
  }
};

const fetchBidderProfile = async () => {
  if (!isSupplierTypeActive.value || profile.value) return;
  bidderLoading.value = true;
  const { ok, data, error } = await useCompanyHelper().getBidderProfile(uuid);
  bidderLoading.value = false;
  if (ok) {
    profile.value = data?.data ?? null;
  } else {
    toast.error({ title: 'Error', message: error, position: 'topRight', layout: 2 });
  }
};

const fetchEntityProfile = async () => {
  if (!isEntityTypeActive.value) return;
  entityLoading.value = true;
  const { ok, data, error } = await useCompanyHelper().getEntityProfile(uuid, entityYear.value);
  entityLoading.value = false;
  if (ok) {
    entityProfile.value = data?.data ?? null;
  } else {
    entityProfile.value = null;
    toast.error({ title: 'Error', message: error, position: 'topRight', layout: 2 });
  }
};

watch(activeCustomerType, (type) => {
  if (type?.kind === 'supplier') fetchBidderProfile();
  if (type?.kind === 'entity') fetchEntityProfile();
});

watch(entityYear, () => {
  if (isEntityTypeActive.value) fetchEntityProfile();
});

onMounted(async () => {
  await fetchCompany();
});

const isRejected = (s) => s?.toUpperCase?.() === 'REJECTED';

const docStatusClass = (s) => ({
  'badge-success': s?.toUpperCase?.() === 'APPROVED',
  'badge-warning': s?.toUpperCase?.() === 'PENDING',
  'badge-error':   s?.toUpperCase?.() === 'REJECTED',
  'badge-ghost':  !s,
});

const paymentBadge = (s) => ({
  'badge-success': s === 'PAID',
  'badge-warning': s === 'AWAITING' || s === 'PENDING',
  'badge-ghost':  !s,
});

const approvalBadge = (s) => ({
  'badge-success': s === 'APPROVED',
  'badge-warning': s === 'AWAITING' || s === 'PENDING',
  'badge-error':   s === 'REJECTED',
  'badge-ghost':  !s,
});

const invoiceBadge = (s) => ({
  'badge-success': s === 'PAID',
  'badge-warning': s === 'PENDING' || s === 'AWAITING',
  'badge-error':   s === 'CANCELLED',
  'badge-ghost':  !s,
});

const suspenseBadge = (s) => ({
  'badge-success': s === 'CLAIMED' || s === 'PROCESSED',
  'badge-warning': s === 'PENDING',
  'badge-ghost':  !s,
});

const formatStatus = value => value
  ? String(value).toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
  : '—';

const userFullName = user => [user?.name, user?.lastname].filter(Boolean).join(' ') || 'Unknown user';

const userInitials = user => [user?.name, user?.lastname]
  .filter(Boolean)
  .map(part => String(part).charAt(0).toUpperCase())
  .join('')
  .slice(0, 2) || 'U';

const assignmentForYear = year => profile.value?.registration_assignments?.find(assignment => Number(assignment.year) === Number(year));

const formatDateTime = value => value
  ? new Date(value).toLocaleString('en-ZW', { dateStyle: 'medium', timeStyle: 'short' })
  : 'Date unavailable';

const statusBadge = value => {
  const status = String(value ?? '').toUpperCase();
  if (['ACTIVE', 'AUTHORIZED', 'PUBLISHED', 'AWARDED', 'CONTRACTED', 'APPROVED'].includes(status)) return 'badge-success';
  if (['CANCELLED', 'SUSPENDED', 'REJECTED'].includes(status)) return 'badge-error';
  if (status.includes('PENDING') || status.includes('EVALUATION') || status === 'STANDSTILL') return 'badge-warning';
  return 'badge-ghost';
};

const formatAmount = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  return Number(v).toLocaleString('en-ZW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatJson = (obj) => {
  try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
};
</script>
