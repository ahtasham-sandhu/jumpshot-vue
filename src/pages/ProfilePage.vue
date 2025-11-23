<template>
  <q-page v-if="person && Object.keys(person).length > 0" class="flex flex-center">
    <div class="q-pa-md" style="width: 600px">
      <q-form @submit.prevent="onSubmit">
        <!-- Input fields for first and last name -->
        <q-input Standard v-model="person.first_name" label="First Name" />
        <q-input Standard v-model="person.last_name" label="Last Name" />

        <div class="flex row justify-between full-width q-mt-xl">
          <div class="col-5">
            <!-- Button to reset the form by fetching the person data again -->
            <q-btn @click="getPerson" size="md" class="full-width" outline label="Reset" color="primary"
              icon="restart_alt" />
          </div>
          <div class="col-5">
            <!-- Button to save the updated person data -->
            <q-btn type="submit" size="md" class="full-width" label="Save" color="primary"
              icon="save" />
          </div>
        </div>
      </q-form>

      <!-- Display helper text with last updated time and version -->
      <div class="text-grey-6 text-center q-mt-xl">
        Last updated: {{ formatDateAndTime(person.changed_on) }}
        <br />
        version: {{ person.version }}
      </div>
    </div>
  </q-page>
  <q-page v-else class="flex flex-center">
    <!-- Spinner displayed while person data is being fetched -->
    <q-spinner color="primary" size="50px" />
  </q-page>
</template>
<script setup>
import { onMounted, computed } from 'vue'
import { usePersonStore } from '@/stores/person'
import { formatDateAndTime } from '@/utils/dateTimeHelper'
import { notifyFailure } from 'src/utils/notify'

// Store instance for managing person data
const personStore = usePersonStore()

// Computed property to access the person object from the store
const person = computed(() => personStore?.person?.person)

// Fetches the person data from the store
const getPerson = async () => {
  try {
    await personStore.fetchPerson()
  } catch (error) {
    notifyFailure(error.message) // Notify user on failure
  }
}

// Submits the updated person data to the store
const onSubmit = async () => {
  try {
    await personStore.updatePerson(person.value)
  } catch (error) {
    notifyFailure(error.message) // Notify user on failure
  }
}

// Fetch person data when the component is mounted
onMounted(getPerson)
</script>