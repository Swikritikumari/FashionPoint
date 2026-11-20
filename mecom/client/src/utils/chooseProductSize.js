import Swal from 'sweetalert2';

export default async function chooseProductSize(sizes, productName) {
  const result = await Swal.fire({
    title: 'Choose a size',
    text: productName,
    input: 'select',
    inputOptions: Object.fromEntries(sizes.map((size) => [size, size])),
    inputPlaceholder: 'Select a size',
    showCancelButton: true,
    confirmButtonText: 'Continue',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#3d52a0',
    inputValidator: (value) => value ? undefined : 'Please select a size'
  });

  return result.isConfirmed ? result.value : '';
}
